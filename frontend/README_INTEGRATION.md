# QuickCare: Shravani's API-connected frontend (React + Tailwind/Vite)

Added to your Figma Make export. Your design, CSS and the Home, Records, Family, Profile screens are unchanged.

## New / changed files
| File | What |
|---|---|
| `src/api.ts` | API client: bearer token, 401 -> sign-out, 403 and network errors, validation errors, FormData upload. Base URL = `VITE_API_BASE` (default `/api`) |
| `src/Live.tsx` | Login, **AmbulanceBooking** (emergency details -> location -> confirm -> live tracking -> cancel), **HomeCareBooking** (nurse, doctor, sample collection), **MyBookings**, **Hospital** Overview / Requests / Admissions / Documents / Profile |
| `src/App.tsx` | Login gate; "Request now", "Book Ambulance", "Home Nurse", "Home Lab Test" open the real pages; Bookings uses real data; Hospital portal uses `HospitalLive`; avatar click signs out |
| `src/index.css` | Appended `.f-*` form/state styles |

Copy `.env.example` to `.env`. Run: `pnpm install && pnpm dev`. Start Ujala's service too: `python -m app.seed && uvicorn app.main:app --reload` (port 8000). The ambulance page loads emergency types and suggestions from it (fields confirmed from her repo); if it is down, booking still works with a built-in type list.

Previous line: Point `/api` at the backend (Vite proxy in `vite.config.ts`, or `VITE_API_BASE`).

## Status (honest)
- Not compiled or run here (no network to install packages) and not tested against a backend. Run `pnpm build` first and send me any errors.
- No mock data: with no backend you see error messages, not fake lists.
- Driver and Laboratory portals still use the original static design (Kuldeep's scope). The role switcher is the original demo; with real login the portal is chosen by `user.role` (patient, driver, hospital, lab).
- Confirmed: the recommendation service (Ujala's repo). Still PROPOSED: login, booking, home care, lab, hospital (her repo doesn't contain them). See `docs/API_MAPPING_CHECKLIST.md`.

## What the others must do
- **Archit:** ambulance booking, tracking, cancel, hospital overview/arrivals/capacity/pre-admissions/transfer-requests/profile endpoints; user roles; synthetic seed data. Say if SSE/WebSocket exists (tracking polls every 5 s).
- **Ujala:** review the checklist with Shravani; `POST /recommendations/emergency` (UI works without it); co-run end-to-end tests.
- **Kartik:** `/lab/tests`, `/homecare/*`, `/hospital/documents` metadata and upload. Agree with Archit who owns nurse/doctor visit APIs.
- **Shreya:** `etaMinutes` in the tracking response, with a fallback.
- **Raj:** make booking -> dispatch -> hospital arrivals -> ETA services work together; confirm final paths and event contracts.
- **Samarth:** token storage (currently sessionStorage), RBAC, CORS, rate limits, location-consent wording.
- **Kuldeep:** crew status updates and GPS must write to the data the tracking endpoint reads.
- Everyone: don't change a contract without telling Shravani and Ujala; synthetic data only.
