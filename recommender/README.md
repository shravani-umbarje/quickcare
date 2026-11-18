# Lifeline Recommender

Emergency recommendation service for the Emergency & Home Healthcare Platform.
Given an emergency type and patient location it recommends an ambulance type and
a hospital (plus 2 alternatives), explains why, stores the outcome, and falls back
to deterministic rules if data is missing/stale or scoring fails.

## Run
```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed                  # loads synthetic demo hospitals
uvicorn app.main:app --reload       # Swagger docs: http://127.0.0.1:8000/docs
pytest                              # run tests
```
Optional env vars: `DATABASE_URL` (default SQLite), `LIFELINE_API_KEY` (enables X-API-Key check).

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/emergency-types | Emergency categories for the Flutter dropdown |
| POST | /api/v1/recommendations | `{emergency_type, latitude, longitude}` -> recommendation |
| GET | /api/v1/recommendations/{id} | Retrieve a stored recommendation |

## Data
All data is synthetic. Hospital reads go through `app/repository.py` only; replace
it with the real hospital/bed API when available.
