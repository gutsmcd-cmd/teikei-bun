# 定型ぶん（teikei-bun）

よく使う文章（住所・挨拶・連絡の定型文など）を保存して、タップでクリップボードにコピーできる PWA です。

**無料・広告なし・ログイン不要・通信なし・アナリティクスなし。** 一度開けばオフラインで動きます。UI は日本語が初期設定で、右上で 日本語 / English を切り替えられます（`teikei-bun-lang`）。

## 主な機能

- タップでコピー（Clipboard API、非対応環境は execCommand にフォールバック）
- カテゴリ別の絞り込みと全文検索（ヒット箇所をハイライト）
- 追加・編集・削除・並べ替え
- 初回はサンプル（住所テンプレート・丁寧な挨拶・日程調整など）入り。不要なら削除できます
- JSON で書き出し／読み込み
- データは localStorage（`teikei-bun:v1`）にだけ保存

## 使い方（開発）

```bash
npm install
npm run dev       # Vite 開発サーバー
npm run build     # 型チェック + 本番ビルド → dist/
npm run preview   # 本番ビルドのプレビュー
```

## デプロイ

GitHub Pages：`.github/workflows/pages.yml`（npm ci → build → `dist` をアップロード → deploy-pages）。`base: './'` なのでサブパス（`/teikei-bun/`）でも動きます。

## プライバシー

データはすべてこの端末のブラウザ内にだけ保存されます。サーバー・外部 API・トラッキング・広告は一切ありません。

---

## English

**Snippets** — Save text you type all the time (addresses, greetings, stock replies) and tap to copy it.

Free, no ads, no login, no network calls, no analytics. Works fully offline once loaded and can be installed to the home screen as a PWA. The UI defaults to Japanese; switch 日本語 / English at the top right.

- Tap a card to copy it to the clipboard
- Filter by category and search titles and text (matches highlighted)
- Add, edit, delete and reorder
- A few Japanese sample snippets on first run, which you can delete
- Export / import JSON
- Data lives only in localStorage (`teikei-bun:v1`)

Tech: Vite + vanilla TypeScript + `vite-plugin-pwa` (`registerType: 'autoUpdate'`, `base: './'`). Deploys to GitHub Pages via `.github/workflows/pages.yml`.
