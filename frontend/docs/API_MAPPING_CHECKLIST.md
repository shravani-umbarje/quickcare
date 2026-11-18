# Frontend ↔ API mapping checklist (Shravani + Ujala)
Status: PROPOSED contracts. Backend owners must confirm or correct each row before integration. Error shape expected everywhere: `{ "message": "...", "errors": { "field": "reason" } }`. All calls send `Authorization: Bearer <token>`.

| # | Screen / action | Method + path | Request | Response | Owner | Confirmed |
|---|---|---|---|---|---|---|
| 1 | Login | POST /auth/login | email, password | token, user{id,name,role} | Archit/Samarth | [ ] |
| 2 | Home bookings list | GET /ambulance/bookings | – | [{id,status,createdAt}] | Archit | [ ] |
| 3 | Emergency types (dropdown) + recommendation | GET /api/v1/emergency-types; POST /api/v1/recommendations (recommender service, default http://127.0.0.1:8000) | emergency_type, latitude, longitude | id, ambulance_type, ambulance_type_label, hospital{id,name,address,distance_km,score,reason}, alternatives[], reason, used_fallback | Ujala | **CONFIRMED from her repo** |
| 4 | Create ambulance booking | POST /ambulance/bookings | emergencyType (a recommender key: cardiac, stroke, trauma, pregnancy, breathing, minor), severity, patientName, contactPhone, notes, pickup, recommendationId | id, status | Archit | [ ] |
| 5 | Track booking (polled 5s) | GET /ambulance/bookings/:id | – | status, etaMinutes, ambulance{plate,driverName,phone}, location{lat,lng}, hospital{name} | Archit + Shreya (ETA) | [ ] |
| 6 | Cancel booking | POST /ambulance/bookings/:id/cancel | – | status | Archit | [ ] |
| 7 | Lab test list | GET /lab/tests | – | [{id,name}] | Kartik | [ ] |
| 8 | Home visit (nurse/doctor) | POST /homecare/visits | type, reason, date, timeSlot, address, phone | id, status | Kartik/Archit (decide owner) | [ ] |
| 9 | Home sample collection | POST /homecare/sample-collections | tests[], date, timeSlot, address, phone | id, status | Kartik | [ ] |
| 10 | Home-care list | GET /homecare/bookings | – | [{id,type,scheduledFor,timeSlot,status}] | Kartik | [ ] |
| 11 | Hospital incoming ambulances | GET /hospital/incoming-ambulances | – | [{plate,emergencyType,severity,etaMinutes,status}] | Archit | [ ] |
| 12 | Read / update capacity | GET, PUT /hospital/capacity | generalBeds, icuBeds | same | Archit | [ ] |
| 14 | Hospital overview stats | GET /hospital/overview | – | incomingPatients, arrivingSoon, bedsAvailable, icuBeds, activeTransfers, highPriorityTransfers, avgHandoverMin | Archit/Raj (analytics) | [ ] |
| 15 | Transfer requests | GET, POST /hospital/transfer-requests | patientName, priority, reason, destination | [{patientName,reason,priority,status}] | Archit | [ ] |
| 16 | Hospital documents | GET /hospital/documents; POST (multipart: name, file) | – | [{id,name,uploadedAt,status}] | Kartik (metadata) | [ ] |
| 17 | Hospital profile | GET, PUT /hospital/profile | name, registrationNo, phone, address | same + readinessPercent | Archit | [ ] |
| 13 | Pre-admissions | GET /hospital/pre-admissions; PATCH /:id | status: accepted/rejected | [{id,patientName,emergencyType,status}] | Archit | [ ] |

Status values assumed: ambulance = requested, assigned, en_route, arrived, completed, cancelled. Pre-admission = pending, accepted, rejected.
Live tracking: polling now; switch to SSE/WebSocket in `track()` (ambulance.html) if Archit exposes a real-time channel.

## UI states covered per screen (tick during joint testing)
loading ✔ error ✔ empty ✔ validation ✔ success ✔ 401 redirect ✔ 403 message ✔ (implemented; verify against real backend)

## End-to-end test script (run with Ujala once APIs exist; attach screenshots/logs)
1. Login as patient → Home → tap **Request ambulance** → lands on ambulance.html directly.
2. Submit invalid form → field errors shown. Submit valid → location step → confirm → booking created.
3. Check DB row exists for the booking; tracking shows persisted status; reload page with `?id=` still works.
4. Stop backend → error banner, no crash. Expire token → redirected to login.
5. Book nurse visit and sample collection → rows in DB → appear in list.
6. Login as hospital → incoming ambulance from step 3 appears; update capacity → persisted; accept pre-admission → status persisted.

**Rows 1, 2, 4-17 are still proposals.** Ujala's repo only contains the recommender; there is no login, booking, home-care, lab or hospital API in it yet. Auth in the recommender is a placeholder X-API-Key; the main backend must define JWT login (row 1).
