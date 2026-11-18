// DEV ONLY: in-memory fake of the PROPOSED API contract (frontend/docs/API_MAPPING_CHECKLIST.md) so the UI and e2e tests run
// before the real backend exists. Synthetic data only. Delete when Archit/Kartik's real APIs are connected.
import http from "node:http";
const PORT = process.env.PORT || 4000, PW = "demo1234", now = () => Date.now();
const users = { "patient@example.com": { id: "u1", name: "Arjun Kapoor", role: "patient" }, "hospital@example.com": { id: "h1", name: "CityCare Hospital", role: "hospital" } };
const db = { bookings: [], homecare: [], transfers: [], tests: [{ id: "t1", name: "Thyroid profile" }, { id: "t2", name: "Complete blood count" }, { id: "t3", name: "HbA1c" }],
  docs: [{ id: "d1", name: "Registration certificate", uploadedAt: new Date().toISOString(), status: "verified" }], cap: { generalBeds: 12, icuBeds: 6 },
  profile: { name: "CityCare Hospital", registrationNo: "HSP-024", phone: "9876541028", address: "18, CMH Road, Indiranagar, Bengaluru 560038" },
  pre: [{ id: "p1", patientName: "Rahul Verma", emergencyType: "cardiac", status: "pending" }, { id: "p2", patientName: "Meera Nair", emergencyType: "trauma", status: "pending" }] };
let seq = 100; const id = (p) => p + ++seq;
const phoneOk = (v = "") => /^[6-9]\d{9}$/.test(String(v).replace(/[\s-]/g, "").replace(/^\+91/, ""));
const view = (b) => { // status moves with elapsed time so tracking can be exercised
  if (b.cancelled) return { ...b, status: "cancelled" };
  const s = (now() - b.t0) / 1000, st = s < 5 ? "requested" : s < 15 ? "assigned" : s < 40 ? "en_route" : s < 70 ? "arrived" : "completed";
  const left = Math.max(0, 1 - s / 40), out = { ...b, status: st, etaMinutes: Math.max(0, Math.ceil(12 * left)) };
  if (st !== "requested") { out.ambulance = { plate: "KA-01-AMB-118", driverName: "Suresh (demo)", phone: "9000000118" }; out.hospital = { name: "CityCare Hospital" }; out.location = { lat: b.pickup.lat + 0.01 * left, lng: b.pickup.lng + 0.01 * left }; }
  return out; };
const bad = (res, errors) => send(res, 422, { message: "Please fix the highlighted fields.", errors });
function send(res, code, body) { res.writeHead(code, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type, X-API-Key", "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS" }); res.end(body === undefined ? "" : JSON.stringify(body)); }
const readRaw = (req) => new Promise((r) => { const c = []; req.on("data", (d) => c.push(d)); req.on("end", () => r(Buffer.concat(c).toString("utf8"))); });
http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);
  const url = new URL(req.url, "http://x"), p = url.pathname.replace(/^\/api/, ""), m = req.method, raw = await readRaw(req);
  let body = {}; if ((req.headers["content-type"] || "").includes("json")) { try { body = JSON.parse(raw || "{}"); } catch { return send(res, 400, { message: "Invalid JSON" }); } }
  if (m === "POST" && p === "/auth/login") { const u = users[body.email]; return u && body.password === PW ? send(res, 200, { token: "tok-" + u.id, user: u }) : send(res, 401, { message: "Invalid email or password" }); }
  const user = Object.values(users).find((u) => "Bearer tok-" + u.id === req.headers.authorization); if (!user) return send(res, 401, { message: "Not signed in" });
  const hosp = p.startsWith("/hospital"); if (hosp && user.role !== "hospital") return send(res, 403, { message: "Forbidden" });
  let r;
  if (m === "GET" && p === "/ambulance/bookings") return send(res, 200, db.bookings.map(view));
  if (m === "POST" && p === "/ambulance/bookings") { const e = {}; if (!body.emergencyType) e.emergencyType = "Required"; if (!phoneOk(body.contactPhone)) e.contactPhone = "Invalid phone"; if (!body.pickup?.address) e.address = "Required"; if (Object.keys(e).length) return bad(res, e);
    const b = { id: id("AMB-"), t0: now(), createdAt: new Date().toISOString(), emergencyType: body.emergencyType, severity: body.severity, patientName: body.patientName, pickup: body.pickup, recommendationId: body.recommendationId ?? null }; db.bookings.push(b); return send(res, 201, { id: b.id, status: "requested" }); }
  if ((r = p.match(/^\/ambulance\/bookings\/([^/]+)(\/cancel)?$/))) { const b = db.bookings.find((x) => x.id === decodeURIComponent(r[1])); if (!b) return send(res, 404, { message: "Booking not found" });
    if (m === "GET" && !r[2]) return send(res, 200, view(b)); if (m === "POST" && r[2]) { b.cancelled = true; return send(res, 200, { status: "cancelled" }); } }
  if (m === "GET" && p === "/lab/tests") return send(res, 200, db.tests);
  if (m === "GET" && p === "/homecare/bookings") return send(res, 200, db.homecare);
  if (m === "POST" && (p === "/homecare/visits" || p === "/homecare/sample-collections")) { const sample = p.includes("sample"), e = {};
    if (!body.date) e.date = "Required"; if (!body.timeSlot) e.timeSlot = "Required"; if (!body.address) e.address = "Required"; if (!phoneOk(body.phone)) e.phone = "Invalid phone"; if (sample && !body.tests?.length) e.tests = "Required"; if (!sample && !body.reason) e.reason = "Required";
    if (Object.keys(e).length) return bad(res, e); const h = { id: id("HC-"), type: sample ? "sample" : body.type, scheduledFor: body.date, timeSlot: body.timeSlot, status: "scheduled" }; db.homecare.push(h); return send(res, 201, h); }
  const live = () => db.bookings.map(view).filter((b) => ["assigned", "en_route"].includes(b.status));
  if (m === "GET" && p === "/hospital/incoming-ambulances") return send(res, 200, live().map((b) => ({ id: b.id, plate: b.ambulance.plate, emergencyType: b.emergencyType, severity: b.severity || "serious", patientSummary: b.patientName, etaMinutes: b.etaMinutes, status: b.status })));
  if (m === "GET" && p === "/hospital/overview") return send(res, 200, { incomingPatients: live().length, arrivingSoon: live().filter((b) => b.etaMinutes <= 5).length, bedsAvailable: db.cap.generalBeds + db.cap.icuBeds, icuBeds: db.cap.icuBeds, activeTransfers: db.transfers.length, highPriorityTransfers: db.transfers.filter((t) => t.priority === "critical").length, avgHandoverMin: 14 });
  if (p === "/hospital/capacity") { if (m === "GET") return send(res, 200, db.cap); if (m === "PUT") { if (!Number.isInteger(body.generalBeds) || !Number.isInteger(body.icuBeds) || body.generalBeds < 0 || body.icuBeds < 0) return bad(res, { capacity: "Whole numbers only" }); db.cap = { generalBeds: body.generalBeds, icuBeds: body.icuBeds }; return send(res, 200, db.cap); } }
  if (m === "GET" && p === "/hospital/pre-admissions") return send(res, 200, db.pre);
  if (m === "PATCH" && (r = p.match(/^\/hospital\/pre-admissions\/([^/]+)$/))) { const x = db.pre.find((q) => q.id === decodeURIComponent(r[1])); if (!x) return send(res, 404, { message: "Not found" }); if (!["accepted", "rejected"].includes(body.status)) return bad(res, { status: "Invalid" }); x.status = body.status; return send(res, 200, x); }
  if (p === "/hospital/transfer-requests") { if (m === "GET") return send(res, 200, db.transfers); if (m === "POST") { const e = {}; if (!body.patientName) e.patientName = "Required"; if (!body.reason) e.reason = "Required"; if (!body.destination) e.destination = "Required"; if (Object.keys(e).length) return bad(res, e); const t = { id: id("TR-"), ...body, status: "requested" }; db.transfers.push(t); return send(res, 201, t); } }
  if (p === "/hospital/documents") { if (m === "GET") return send(res, 200, db.docs); if (m === "POST") { const n = /name="name"\r\n\r\n([^\r]*)/.exec(raw)?.[1]; if (!n) return bad(res, { name: "Required" }); const d = { id: id("D-"), name: n, uploadedAt: new Date().toISOString(), status: "pending" }; db.docs.push(d); return send(res, 201, d); } }
  if (p === "/hospital/profile") { if (m === "GET") return send(res, 200, { ...db.profile, readinessPercent: Object.values(db.profile).every(Boolean) ? 92 : 60 }); if (m === "PUT") { const e = {}; if (!body.name) e.name = "Required"; if (!phoneOk(body.phone)) e.phone = "Invalid phone"; if (Object.keys(e).length) return bad(res, e); db.profile = { ...db.profile, ...body }; return send(res, 200, db.profile); } }
  send(res, 404, { message: "Not found: " + m + " " + p });
}).listen(PORT, () => console.log(`DEV fake API on http://127.0.0.1:${PORT}/api  (patient@example.com / hospital@example.com, password ${PW})`));
