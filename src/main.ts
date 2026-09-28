import './style.css';
import { lang, switchLang, t, type Lang } from './i18n';
import { samples } from './samples';
import { closeSheet, downloadBlob, esc, openSheet, pickFile, registerPwa, showToast, todayStamp, uid } from './ui';

interface Snippet {
  id: string;
  title: string;
  category: string;
  body: string;
}

interface State {
  snippets: Snippet[];
}

const STORE_KEY = 'teikei-bun:v1';
const app = document.querySelector<HTMLDivElement>('#app')!;

let query = '';
let activeCat: string | null = null;
let reorder = false;

function sanitize(v: unknown): Snippet | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.body !== 'string') return null;
  return {
    id: typeof o.id === 'string' ? o.id : uid(),
    title: typeof o.title === 'string' ? o.title : '',
    category: typeof o.category === 'string' ? o.category : '',
    body: o.body,
  };
}

function load(): State {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw === null) {
    // First run: seed deletable samples in the current UI language.
    return { snippets: samples(lang()).map((s) => ({ id: uid(), ...s })) };
  }
  try {
    const s = JSON.parse(raw) as Partial<State>;
    return { snippets: Array.isArray(s.snippets) ? s.snippets.map(sanitize).filter((x): x is Snippet => !!x) : [] };
  } catch {
    return { snippets: [] };
  }
}

const state = load();
save();

function save(): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function categories(): string[] {
  const seen: string[] = [];
  for (const s of state.snippets) {
    const c = s.category.trim();
    if (c && !seen.includes(c)) seen.push(c);
  }
  return seen;
}

function visible(): Snippet[] {
  const q = query.trim().toLowerCase();
  return state.snippets.filter((s) => {
    if (activeCat !== null && s.category.trim() !== activeCat) return false;
    if (!q) return true;
    return `${s.title}\n${s.body}\n${s.category}`.toLowerCase().includes(q);
  });
}

function highlight(text: string): string {
  const safe = esc(text);
  const q = query.trim();
  if (!q) return safe;
  const qs = esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(qs, 'gi'), (m) => `<mark>${m}</mark>`);
}

// ---------- render ----------
function renderShell(): void {
  const l = lang();
  app.innerHTML = `
  <header>
    <div class="header-row">
      <div class="titles">
        <img class="logo" src="./icons/icon-192.png" alt="" />
        <div>
          <h1>${t('appTitle')}</h1>
          <p class="sub">${t('appSub')}</p>
        </div>
      </div>
      <div class="lang-toggle" role="group" aria-label="Language">
        <button type="button" data-lang="ja" class="${l === 'ja' ? 'active' : ''}">日本語</button>
        <button type="button" data-lang="en" class="${l === 'en' ? 'active' : ''}">English</button>
      </div>
    </div>
  </header>
  <div class="search-wrap">
    <svg class="search-icon" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
    <input type="search" id="q" placeholder="${esc(t('searchPh'))}" aria-label="${esc(t('search'))}" value="${esc(query)}" autocomplete="off" />
  </div>
  <div id="chips"></div>
  <div id="list" class="main"></div>
  <div class="data-row">
    <span class="muted">${t('data')}</span>
    <button type="button" class="btn small" data-export>⬇ ${t('exportJson')}</button>
    <button type="button" class="btn small" data-import>⬆ ${t('importJson')}</button>
  </div>
  <footer class="note">${t('footer')}</footer>
  <button type="button" class="fab" data-add><span aria-hidden="true">＋</span>${t('add')}</button>
  `;
  app.querySelector<HTMLInputElement>('#q')!.addEventListener('input', (e) => {
    query = (e.target as HTMLInputElement).value;
    renderList();
  });
  renderList();
}

function renderList(): void {
  const cats = categories();
  if (activeCat !== null && !cats.includes(activeCat)) activeCat = null;
  app.querySelector('#chips')!.innerHTML = cats.length
    ? `<div class="chips" role="tablist">
        <button type="button" class="chip ${activeCat === null ? 'active' : ''}" data-cat="">${t('all')}</button>
        ${cats.map((c) => `<button type="button" class="chip ${activeCat === c ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>`
    : '';
  const list = visible();
  const listEl = app.querySelector('#list')!;
  if (!state.snippets.length) {
    listEl.innerHTML = `<div class="empty"><div class="big">📝</div><p><strong>${t('emptyTitle')}</strong></p><p>${t('emptyBody')}</p></div>`;
    return;
  }
  const toolbar = `
    <div class="toolbar">
      <span class="muted">${t('count', { n: list.length })} · ${t('tapToCopy')}</span>
      <button type="button" class="btn small ${reorder ? 'primary' : 'ghost'}" data-reorder>${reorder ? t('done') : '↕ ' + t('reorder')}</button>
    </div>`;
  if (!list.length) {
    listEl.innerHTML = toolbar + `<div class="empty"><div class="big">🔍</div><p>${t('noResults')}</p></div>`;
    return;
  }
  listEl.innerHTML =
    toolbar +
    `<ul class="snips">${list
      .map(
        (s, i) => `
      <li class="snip card ${reorder ? 'reordering' : ''}" data-id="${s.id}">
        <button type="button" class="snip-copy" data-copy="${s.id}" ${reorder ? 'tabindex="-1"' : ''}>
          <span class="snip-head">
            <span class="snip-title">${highlight(s.title || t('untitled'))}</span>
            ${s.category ? `<span class="tag">${esc(s.category)}</span>` : ''}
          </span>
          <span class="snip-body">${highlight(s.body)}</span>
        </button>
        <span class="copied-badge" aria-hidden="true">✓ ${t('copied')}</span>
        <span class="snip-side">
          ${
            reorder
              ? `<button type="button" class="icon-btn sm" data-move="${s.id}:-1" aria-label="${t('moveUp')}" ${i === 0 ? 'disabled' : ''}>↑</button>
                 <button type="button" class="icon-btn sm" data-move="${s.id}:1" aria-label="${t('moveDown')}" ${i === list.length - 1 ? 'disabled' : ''}>↓</button>`
              : `<button type="button" class="icon-btn sm ghosty" data-edit="${s.id}" aria-label="${t('edit')}">✎</button>`
          }
        </span>
      </li>`,
      )
      .join('')}</ul>`;
}

// ---------- actions ----------
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

function moveVisible(id: string, dir: -1 | 1): void {
  const vis = visible();
  const vi = vis.findIndex((s) => s.id === id);
  const other = vis[vi + dir];
  if (!other) return;
  const a = state.snippets.findIndex((s) => s.id === id);
  const b = state.snippets.findIndex((s) => s.id === other.id);
  [state.snippets[a], state.snippets[b]] = [state.snippets[b]!, state.snippets[a]!];
  save();
  renderList();
}

function openForm(sn: Snippet | null): void {
  const draft: Snippet = sn ? { ...sn } : { id: uid(), title: '', category: activeCat ?? '', body: '' };
  const sheet = openSheet(`
    <h2>${sn ? t('editSnippet') : t('addSnippet')}</h2>
    <label class="field">${t('title')}
      <input type="text" id="f-title" maxlength="60" placeholder="${esc(t('titlePh'))}" value="${esc(draft.title)}" />
    </label>
    <label class="field">${t('category')}
      <input type="text" id="f-cat" maxlength="30" list="cat-list" placeholder="${esc(t('categoryPh'))}" value="${esc(draft.category)}" autocomplete="off" />
      <datalist id="cat-list">${categories().map((c) => `<option value="${esc(c)}"></option>`).join('')}</datalist>
    </label>
    ${
      categories().length
        ? `<div class="chips cat-pick">${categories()
            .map((c) => `<button type="button" class="chip" data-pick="${esc(c)}">${esc(c)}</button>`)
            .join('')}</div>`
        : ''
    }
    <label class="field">${t('body')} <span class="char-count" id="f-count"></span>
      <textarea id="f-body" rows="6" placeholder="${esc(t('bodyPh'))}">${esc(draft.body)}</textarea>
    </label>
    <div class="actions">
      ${sn ? `<button type="button" class="btn danger" data-f="delete">${t('delete')}</button>` : ''}
      <button type="button" class="btn" data-f="cancel">${t('cancel')}</button>
      <button type="button" class="btn primary" data-f="save">${t('save')}</button>
    </div>
  `);
  const body = sheet.querySelector<HTMLTextAreaElement>('#f-body')!;
  const catIn = sheet.querySelector<HTMLInputElement>('#f-cat')!;
  const count = sheet.querySelector<HTMLSpanElement>('#f-count')!;
  const updateCount = () => (count.textContent = t('chars', { n: [...body.value].length }));
  updateCount();
  body.addEventListener('input', updateCount);
  if (!sn) window.setTimeout(() => sheet.querySelector<HTMLInputElement>('#f-title')!.focus(), 60);
  sheet.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const pick = target.closest<HTMLElement>('[data-pick]')?.dataset.pick;
    if (pick !== undefined) {
      catIn.value = pick;
      return;
    }
    const f = target.closest<HTMLElement>('[data-f]')?.dataset.f;
    if (f === 'cancel') closeSheet();
    if (f === 'delete' && sn) {
      if (!confirm(t('confirmDelete', { t: sn.title || t('untitled') }))) return;
      state.snippets = state.snippets.filter((x) => x.id !== sn.id);
      save();
      closeSheet();
      renderList();
      showToast(t('deleted'));
    }
    if (f === 'save') {
      if (!body.value.trim()) {
        showToast(t('needBody'));
        body.focus();
        return;
      }
      const next: Snippet = {
        ...draft,
        title: sheet.querySelector<HTMLInputElement>('#f-title')!.value.trim(),
        category: catIn.value.trim(),
        body: body.value.replace(/\s+$/, ''),
      };
      const i = state.snippets.findIndex((x) => x.id === next.id);
      if (i >= 0) state.snippets[i] = next;
      else state.snippets.unshift(next);
      save();
      closeSheet();
      renderList();
      showToast(t('saved'));
    }
  });
}

function exportJson(): void {
  const data = { app: 'teikei-bun', version: 1, exportedAt: new Date().toISOString(), snippets: state.snippets };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `teikei-bun-${todayStamp()}.json`);
  showToast(t('exported'));
}

async function importJson(): Promise<void> {
  const file = await pickFile('application/json,.json');
  if (!file) return;
  try {
    const data = JSON.parse(await file.text()) as unknown;
    const arr = Array.isArray(data) ? data : (data as { snippets?: unknown[] })?.snippets;
    if (!Array.isArray(arr)) throw new Error('format');
    const items = arr.map(sanitize).filter((x): x is Snippet => !!x);
    if (!items.length) throw new Error('empty');
    const ids = new Set(state.snippets.map((s) => s.id));
    for (const s of items) {
      if (ids.has(s.id)) s.id = uid();
      state.snippets.push(s);
    }
    save();
    renderList();
    showToast(t('imported', { n: items.length }));
  } catch {
    showToast(t('importFailed'));
  }
}

app.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const l = target.closest<HTMLElement>('[data-lang]')?.dataset.lang as Lang | undefined;
  if (l) {
    switchLang(l);
    renderShell();
    return;
  }
  const cat = target.closest<HTMLElement>('[data-cat]')?.dataset.cat;
  if (cat !== undefined) {
    activeCat = cat === '' ? null : cat;
    renderList();
    return;
  }
  if (target.closest('[data-add]')) return openForm(null);
  if (target.closest('[data-reorder]')) {
    reorder = !reorder;
    return renderList();
  }
  if (target.closest('[data-export]')) return exportJson();
  if (target.closest('[data-import]')) return void importJson();
  const mv = target.closest<HTMLElement>('[data-move]')?.dataset.move;
  if (mv) {
    const [id, dir] = mv.split(':');
    return moveVisible(id!, Number(dir) as -1 | 1);
  }
  const ed = target.closest<HTMLElement>('[data-edit]')?.dataset.edit;
  if (ed) {
    const sn = state.snippets.find((s) => s.id === ed);
    if (sn) openForm(sn);
    return;
  }
  const cp = target.closest<HTMLElement>('[data-copy]');
  if (cp && !reorder) {
    const sn = state.snippets.find((s) => s.id === cp.dataset.copy);
    if (!sn) return;
    void copyText(sn.body).then((ok) => {
      showToast(ok ? `✓ ${t('copied')}` : t('copyFailed'));
      if (ok) {
        const li = cp.closest('.snip');
        li?.classList.remove('flash');
        void (li as HTMLElement | null)?.offsetWidth;
        li?.classList.add('flash');
        if (navigator.vibrate) navigator.vibrate(10);
      }
    });
  }
});

document.documentElement.lang = lang();
renderShell();
registerPwa();
