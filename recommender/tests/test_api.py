from datetime import datetime, timedelta
from app.models import HospitalCapacity, HospitalSpecialty

BANDRA = {"latitude": 19.0596, "longitude": 72.8295}


def test_emergency_types(client):
    r = client.get("/api/v1/emergency-types")
    assert r.status_code == 200
    assert {"cardiac", "stroke", "minor"} <= {t["key"] for t in r.json()}


def test_cardiac_recommendation_success(client):
    r = client.post("/api/v1/recommendations", json={"emergency_type": "cardiac", **BANDRA})
    assert r.status_code == 201
    body = r.json()
    assert body["ambulance_type"] == "ICU_CARDIAC"
    assert body["used_fallback"] is False
    assert body["hospital"]["name"] == "Demo Heart Institute"
    assert len(body["alternatives"]) == 2
    assert "ICU beds" in body["hospital"]["reason"]


def test_same_input_same_output(client):
    p = {"emergency_type": "stroke", **BANDRA}
    a, b = client.post("/api/v1/recommendations", json=p).json(), client.post("/api/v1/recommendations", json=p).json()
    assert a["hospital"]["id"] == b["hospital"]["id"]


def test_recommendation_persisted_and_retrievable(client):
    created = client.post("/api/v1/recommendations", json={"emergency_type": "minor", **BANDRA}).json()
    got = client.get(f"/api/v1/recommendations/{created['id']}")
    assert got.status_code == 200
    assert got.json()["reason"] == created["reason"]
    assert got.json()["hospital"]["id"] == created["hospital"]["id"]


def test_unknown_emergency_type_422(client):
    r = client.post("/api/v1/recommendations", json={"emergency_type": "alien", **BANDRA})
    assert r.status_code == 422
    assert "valid_types" in r.json()["detail"]


def test_bad_coordinates_422(client):
    r = client.post("/api/v1/recommendations", json={"emergency_type": "cardiac", "latitude": 200, "longitude": 72})
    assert r.status_code == 422


def test_not_found_404(client):
    assert client.get("/api/v1/recommendations/9999").status_code == 404


def test_stale_capacity_triggers_fallback(client, db):
    old = datetime.utcnow() - timedelta(hours=24)
    for c in db.query(HospitalCapacity).all():
        c.updated_at = old
    db.commit()
    body = client.post("/api/v1/recommendations", json={"emergency_type": "cardiac", **BANDRA}).json()
    assert body["used_fallback"] is True
    assert body["reason"].startswith("Rule-based fallback")
    assert body["hospital"] is not None


def test_all_icu_full_falls_back(client, db):
    for c in db.query(HospitalCapacity).all():
        c.icu_beds_available = 0
    db.commit()
    body = client.post("/api/v1/recommendations", json={"emergency_type": "cardiac", **BANDRA}).json()
    assert body["used_fallback"] is True


def test_no_hospital_has_specialty(client, db):
    db.query(HospitalSpecialty).filter_by(specialty="neurology").delete()
    db.commit()
    body = client.post("/api/v1/recommendations", json={"emergency_type": "stroke", **BANDRA}).json()
    assert body["hospital"] is None
    assert "No hospital" in body["reason"]


def test_api_key_enforced_when_configured(client, monkeypatch):
    monkeypatch.setenv("LIFELINE_API_KEY", "secret")
    assert client.get("/api/v1/emergency-types").status_code == 401
    assert client.get("/api/v1/emergency-types", headers={"X-API-Key": "secret"}).status_code == 200
