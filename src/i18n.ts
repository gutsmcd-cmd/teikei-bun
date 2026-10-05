export type Lang = 'ja' | 'en';

const LANG_KEY = 'teikei-bun-lang';

export function getLang(): Lang {
  const v = localStorage.getItem(LANG_KEY);
  if (v === 'en' || v === 'ja') return v;
  return 'ja';
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
}

type Dict = Record<string, string>;

let current: Lang = getLang();

export function lang(): Lang {
  return current;
}

export function switchLang(l: Lang): void {
  current = l;
  setLang(l);
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = dictionaries[current][key] ?? dictionaries.ja[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.split(`{${k}}`).join(String(v)),
    raw,
  );
}

const ja: Dict = {
  appTitle: '定型ぶん',
  appSub: 'よく使う文章をタップでコピー',
  search: '検索',
  searchPh: 'タイトル・本文を検索',
  all: 'すべて',
  add: '追加',
  addSnippet: '定型文を追加',
  editSnippet: '定型文を編集',
  title: 'タイトル',
  titlePh: '例：自宅の住所',
  category: 'カテゴリ',
  categoryPh: '例：ビジネス',
  body: '本文',
  bodyPh: 'コピーしたい文章',
  save: '保存',
  cancel: 'キャンセル',
  delete: '削除',
  edit: '編集',
  confirmDelete: '「{t}」を削除しますか？',
  copied: 'コピーしました',
  copyFailed: 'コピーできませんでした',
  reorder: '並べ替え',
  done: '完了',
  emptyTitle: '定型文がありません',
  emptyBody: '右下の「追加」から、よく使う文章を登録しましょう。',
  noResults: '見つかりませんでした',
  needBody: '本文を入力してください',
  saved: '保存しました',
  deleted: '削除しました',
  data: 'データ',
  exportJson: 'JSONを書き出す',
  importJson: 'JSONを読み込む',
  exported: '書き出しました',
  imported: '{n}件を読み込みました',
  importFailed: '読み込めませんでした（形式が違います）',
  tapToCopy: 'タップでコピー',
  chars: '{n}文字',
  count: '{n}件',
  untitled: '（無題）',
  noCat: '未分類',
  moveUp: '上へ',
  moveDown: '下へ',
  footer: 'データはこの端末だけに保存 · 無料 · 広告なし · ログイン不要',
};

const en: Dict = {
  appTitle: 'My Common Phrases',
  appSub: 'Tap to copy the text you type all the time',
  search: 'Search',
  searchPh: 'Search titles and text',
  all: 'All',
  add: 'Add',
  addSnippet: 'New snippet',
  editSnippet: 'Edit snippet',
  title: 'Title',
  titlePh: 'e.g. Home address',
  category: 'Category',
  categoryPh: 'e.g. Work',
  body: 'Text',
  bodyPh: 'The text to copy',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  confirmDelete: 'Delete “{t}”?',
  copied: 'Copied',
  copyFailed: 'Could not copy',
  reorder: 'Reorder',
  done: 'Done',
  emptyTitle: 'No snippets yet',
  emptyBody: 'Tap “Add” to save text you use often.',
  noResults: 'No matches',
  needBody: 'Please enter some text',
  saved: 'Saved',
  deleted: 'Deleted',
  data: 'Data',
  exportJson: 'Export JSON',
  importJson: 'Import JSON',
  exported: 'Exported',
  imported: 'Imported {n} snippet(s)',
  importFailed: 'Could not import (wrong format)',
  tapToCopy: 'Tap to copy',
  chars: '{n} chars',
  count: '{n} snippets',
  untitled: '(untitled)',
  noCat: 'Uncategorised',
  moveUp: 'Move up',
  moveDown: 'Move down',
  footer: 'Data stays on this device · free · no ads · no login',
};

const dictionaries: Record<Lang, Dict> = { ja, en };
