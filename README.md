# QuickCare: integrated project (frontend + recommendation service)

| Folder | What | Owner |
|---|---|---|
| `frontend/` | React + Tailwind (Figma Make export) with API-connected screens | Shravani (+ Ujala for integration) |
| `recommender/` | FastAPI emergency recommendation service | Ujala |
| `dev-api/` | DEV-ONLY fake of the proposed main-backend API (in-memory, synthetic). Login: `patient@example.com` or `hospital@example.com`, password `demo1234`. Replace with the real backend | shared |
| `e2e/` | Playwright end-to-end tests (patient booking, home care, hospital) | Shravani + Ujala |
| `scripts/smoke*.mjs` | Contract check of the recommender endpoints the UI uses | shared |

## Run
Windows: double-click `start.bat`. Mac/Linux: `./start.sh`. Frontend: http://localhost:8443 | Recommender docs: http://127.0.0.1:8000/docs

Manual: (1) `cd recommender && pip install -r requirements.txt && python -m app.seed && uvicorn app.main:app --reload` (2) `cd frontend && cp .env.example .env && pnpm install && pnpm dev`

## Check it works
0. `node scripts/smoke-dev-api.mjs` (fake API running) must print all PASS.
1. `node scripts/smoke.mjs` (recommender running) must print all PASS.
2. `cd recommender && pytest` (Ujala's tests).
3. `cd frontend && pnpm build` must finish with no errors.
4. `cd e2e && pnpm install && npx playwright install chromium && pnpm test`, then fill `frontend/docs/E2E_TEST_EVIDENCE.md`.
5. Browser walk-through: see `frontend/README_INTEGRATION.md` and `frontend/docs/API_MAPPING_CHECKLIST.md`.

## Integrated vs still missing
- Integrated: emergency types and recommendations (ambulance page <-> recommender).
- Runs today against `dev-api/` (fake): login, ambulance booking/tracking, home care, lab tests, hospital screens. The REAL backend for these does not exist in this repo yet; the group must build it to the checklist and then remove `dev-api/`. Owners are listed in `frontend/README_INTEGRATION.md`. Until then those screens show a clear "cannot reach the server" message.
- Not verified: nothing here has been compiled or run by the assistant that prepared it.
