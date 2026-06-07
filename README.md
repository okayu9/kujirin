# Kujirin（くじりん）

Webブラウザで動作するあみだくじアプリ。シングルHTMLファイルとしてビルドされるため、オフラインでも利用可能。

## 開発

```bash
# 依存パッケージのインストール
npm install

# CI と同じ依存解決で確認する場合
npm ci

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

# 単一HTMLのサイズチェック（npm run build 後）
npm run check:dist-size
```

## 技術スタック

- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite + vite-plugin-singlefile

## ライセンス

ISC License

Copyright (c) 2026 Yumeto Inaoka

詳細は [LICENSE](LICENSE) を参照してください。
