# Kujirin（くじりん）

Webブラウザで動作するあみだくじアプリ。シングルHTMLファイルとしてビルドされるため、オフラインでも利用可能。

## 開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド（dist/index.html に出力）
npm run build

# テスト実行
npm run test

# 型チェック
npm run typecheck

# Lint
npm run lint
```

## 技術スタック

- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite + vite-plugin-singlefile
