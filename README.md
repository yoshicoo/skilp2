# SKILP — スキル可視化Webアプリ

Next.js (App Router) + Vercel デプロイ前提。固定認証 / 複数ファイルアップロード（PDF/Word） / GPT-4o mini 解析 / 一問一答ウィザード / CV可視化。

## ローカル実行

```bash
cp .env.example .env.local
# .env.local の OPENAI_API_KEY を設定
npm i
npm run dev
```

ログイン: ID `test@shiftinc.jp` / PW `p@ssword`

## 環境変数
- `OPENAI_API_KEY`
- `AUTH_ID`, `AUTH_PASSWORD`

## 注意
- 検証用。実運用時はセキュリティ・監査ログ等を強化してください。
