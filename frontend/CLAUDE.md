@AGENTS.md

# 私の知識図鑑

学んだことをAIが構造化し、図鑑カードとして蓄積する個人用アプリ。

## 構成

- `backend/` — FastAPI + SQLAlchemy + Alembic。Supabase(PostgreSQL)。`localhost:8000`
- `frontend/` — Next.js 16 (App Router) + TypeScript + Tailwind。`localhost:3000`
- 2つは独立したプロセス。両方起動しないと動かない

## 守ること

- 型の正は `backend/app/schemas.py`。`frontend/src/lib/types.ts` はその写し。片方だけ変えない
- API呼び出しは `frontend/src/lib/api.ts` に集約。コンポーネント内で直接 fetch しない
- DBスキーマの変更は Alembic 経由。`Base.metadata.create_all()` は使わない
- LLM呼び出しは `backend/app/services/llm.py` の中だけ。外にSDKを漏らさない

## 実行

- backend: `backend/` で `uvicorn app.main:app --reload`
- frontend: `frontend/` で `npm run dev`
- マイグレーション: `backend/` で `alembic revision --autogenerate -m "..."` → `alembic upgrade head`

## やらないこと

- MVP範囲外の機能追加（詳細は `docs/discovery-zukan-design.md`）
- `.env` の内容を読む・書く
