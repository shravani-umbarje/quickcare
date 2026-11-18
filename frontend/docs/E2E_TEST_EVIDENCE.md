# End-to-end test evidence (fill in after running; do not pre-fill)
Run (joint with Ujala): `node scripts/smoke.mjs` (recommender running), `node scripts/smoke-dev-api.mjs` (fake API running), then `cd e2e && pnpm install && npx playwright install chromium && pnpm test`. HTML report: `pnpm report`; screenshots are saved per test.

| # | Scenario | Run by | Date | Result | Evidence (report / screenshot path) |
|---|---|---|---|---|---|
| 1 | Login failure message | | | | |
| 2 | Request now -> ambulance page, validation, booking, tracking, cancel | | | | |
| 3 | Booking in My bookings | | | | |
| 4 | Home nurse booking | | | | |
| 5 | Home sample collection | | | | |
| 6 | Hospital overview, transfer, capacity, pre-admission, profile | | | | |
| 7 | Recommender contract (`smoke.mjs`) | | | | |
| 8 | **Repeat 2-6 against the REAL backend** (required for "real persisted data") | | | | |

Rows 1-7 use the dev fake API for the main backend. Only row 8 satisfies the acceptance criteria.
