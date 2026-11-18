// Checks the integration contract against a RUNNING recommender. Usage: node scripts/smoke.mjs [baseUrl]
const B = process.argv[2] || "http://127.0.0.1:8000", H = process.env.LIFELINE_API_KEY ? { "X-API-Key": process.env.LIFELINE_API_KEY } : {};
let fail = 0; const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fail++; };
const j = async (p, o = {}) => { const r = await fetch(B + p, { ...o, headers: { "Content-Type": "application/json", ...H } }); return [r.status, await r.json().catch(() => null)]; };
try {
  let [s, d] = await j("/health"); ok(s === 200 && d?.status === "ok", "GET /health");
  [s, d] = await j("/api/v1/emergency-types"); ok(s === 200 && d.some((t) => t.key === "cardiac"), "emergency types include cardiac");
  [s, d] = await j("/api/v1/recommendations", { method: "POST", body: JSON.stringify({ emergency_type: "cardiac", latitude: 19.076, longitude: 72.8777 }) });
  ok(s === 201 && d.ambulance_type_label && "reason" in d && Array.isArray(d.alternatives), "POST recommendation returns the fields the UI reads");
  const id = d?.id; [s, d] = await j("/api/v1/recommendations/" + id); ok(s === 200 && d.id === id, "stored recommendation can be retrieved");
  [s] = await j("/api/v1/recommendations", { method: "POST", body: JSON.stringify({ emergency_type: "nope", latitude: 1, longitude: 1 }) }); ok(s === 422, "unknown emergency type gives 422");
} catch (e) { console.log("FAIL cannot reach " + B + " (" + e.message + "). Is uvicorn running?"); fail++; }
process.exit(fail ? 1 : 0);
