#!/usr/bin/env bash
# Starts the recommender (8000) and the frontend. Run from this folder. Needs Python 3.10+, Node 18+, pnpm.
set -e
node dev-api/server.mjs &
(cd recommender && python -m venv .venv && . .venv/bin/activate && pip install -q -r requirements.txt && python -m app.seed && uvicorn app.main:app --port 8000) &
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env
(cd frontend && pnpm install && pnpm dev) &
wait
