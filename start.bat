@echo off
REM Windows: opens two windows. Needs Python 3.10+, Node 18+, pnpm.
if not exist frontend\.env copy frontend\.env.example frontend\.env
start "dev-api" cmd /k "node dev-api\server.mjs"
start "recommender" cmd /k "cd recommender && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt && python -m app.seed && uvicorn app.main:app --port 8000"
start "frontend" cmd /k "cd frontend && pnpm install && pnpm dev"
