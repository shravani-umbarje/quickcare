import json
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import repository
from .categories import CATEGORIES, AMBULANCE_TYPES
from .fallback import fallback_rank
from .models import Hospital, Recommendation
from .scoring import rank_hospitals, ScoredHospital
from .models import Hospital, Recommendation, utcnow

log = logging.getLogger(__name__)
STALE_AFTER = timedelta(hours=6)
ALTERNATIVES = 2


class UnknownEmergencyType(ValueError):
    pass


def _hospital_dict(s: ScoredHospital) -> dict:
    h = s.hospital
    return {"id": h.id, "name": h.name, "address": h.address, "latitude": h.latitude,
            "longitude": h.longitude, "distance_km": s.distance_km, "score": s.score, "reason": s.reason}


def _capacity_is_fresh(candidates, now) -> bool:
    relevant = [c for c in candidates if c.has_specialty]
    return bool(relevant) and all(
        c.capacity_updated_at is not None and now - c.capacity_updated_at <= STALE_AFTER
        for c in relevant)


def recommend(db: Session, emergency_type: str, lat: float, lng: float,
              now: datetime | None = None) -> dict:
    """Returns the API response dict. Chosen hospital details are stored in the
    recommendations row (id + score + reason + alternatives)."""
    cat = CATEGORIES.get(emergency_type)
    if cat is None:
        raise UnknownEmergencyType(emergency_type)
    now = now or utcnow()

    ranked, used_fallback = [], False
    try:
        candidates = repository.get_candidates(db, cat.required_specialty)
        if _capacity_is_fresh(candidates, now):
            ranked = rank_hospitals(candidates, cat, lat, lng)
        if not ranked:  # stale/missing capacity, or nothing passed the filters
            ranked = fallback_rank(candidates, cat, lat, lng)
            used_fallback = True
    except Exception:
        log.exception("Scoring failed; using fallback")
        used_fallback = True
        try:
            ranked = fallback_rank(repository.get_candidates(db, cat.required_specialty), cat, lat, lng)
        except Exception:
            log.exception("Fallback failed too")
            ranked = []

    best = ranked[0] if ranked else None
    alts = ranked[1:1 + ALTERNATIVES]
    if best:
        prefix = "Rule-based fallback: " if used_fallback else "Recommended: "
        reason = (f"{prefix}{best.hospital.name} for {cat.label.lower()} - {best.reason}. "
                  f"Ambulance: {AMBULANCE_TYPES[cat.ambulance_type]}.")
    else:
        reason = (f"No hospital found with {cat.required_specialty} capability. "
                  f"Ambulance: {AMBULANCE_TYPES[cat.ambulance_type]}. Contact control room.")

    rec = Recommendation(
        emergency_type=cat.key, patient_lat=lat, patient_lng=lng,
        ambulance_type=cat.ambulance_type,
        chosen_hospital_id=best.hospital.id if best else None,
        score=best.score if best else None, reason=reason,
        alternatives_json=json.dumps([_hospital_dict(a) for a in alts]),
        used_fallback=used_fallback, created_at=now)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return to_response(db, rec, best_override=_hospital_dict(best) if best else None)


def to_response(db: Session, rec: Recommendation, best_override: dict | None = None) -> dict:
    best = best_override
    if best is None and rec.chosen_hospital_id is not None:
        h = db.get(Hospital, rec.chosen_hospital_id)
        best = {"id": h.id, "name": h.name, "address": h.address, "latitude": h.latitude,
                "longitude": h.longitude, "distance_km": 0.0, "score": rec.score or 0.0,
                "reason": rec.reason}
    return {
        "id": rec.id, "emergency_type": rec.emergency_type,
        "ambulance_type": rec.ambulance_type,
        "ambulance_type_label": AMBULANCE_TYPES[rec.ambulance_type],
        "hospital": best, "alternatives": json.loads(rec.alternatives_json),
        "reason": rec.reason, "used_fallback": rec.used_fallback, "created_at": rec.created_at,
    }
