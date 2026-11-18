# Implementation note: Shravani (Patient/Hospital frontend + frontend-backend integration)
Branch suggestion: `feature/shravani-ambulance-homecare-hospital`

## Scope delivered (frontend/)
- Dedicated ambulance page (details -> location -> confirm -> tracking -> cancel); "Request now" and "Book Ambulance" open it.
- Home healthcare: nurse visit, doctor visit, sample collection. My bookings list. Login.
- Hospital portal: Overview, Requests (transfer requests), Admissions (capacity, pre-admissions), Documents (upload), Profile.
- API client with auth, 401/403/network/validation handling; loading, error, empty, validation, success states on every screen.
- Integrated with Ujala's recommender: emergency types and recommendations (`/api/v1/*`).

## Assumptions (raise before changing shared contracts)
- Main-backend paths and fields are PROPOSED (`frontend/docs/API_MAPPING_CHECKLIST.md`); only the recommender rows are confirmed.
- Stack follows the Figma Make export (React 19, Vite, Tailwind). Existing Home/Records/Family/Profile untouched.
- Hospital Documents/Profile are simplified forms (original static design replaced to persist data). Requests/Admissions layouts are mine.
- Tracking polls every 5 s; swap for SSE/WebSocket if Archit provides one.

## Testing
`dev-api/` is a DEV-ONLY fake of the proposed contract (verified by `scripts/smoke-dev-api.mjs`, 15 checks). Playwright specs in `e2e/`. Evidence template: `docs/E2E_TEST_EVIDENCE.md`. Nothing has been run against the real backend.

## Open dependencies
Archit: ambulance + hospital APIs. Kartik: lab, home-care, documents. Shreya: etaMinutes. Raj: service integration/contracts. Samarth: auth/RBAC review. Details in `frontend/README_INTEGRATION.md`.
