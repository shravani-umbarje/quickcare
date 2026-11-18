"""The ONLY place hospital data is read. When Archit's real hospital/bed API
is ready, replace get_candidates() and nothing else changes."""
from sqlalchemy.orm import Session, joinedload
from .models import Hospital
from .scoring import HospitalCandidate


def get_candidates(db: Session, specialty: str) -> list[HospitalCandidate]:
    hospitals = db.query(Hospital).options(
        joinedload(Hospital.capacity), joinedload(Hospital.specialties)).all()
    result = []
    for h in hospitals:
        spec = next((s for s in h.specialties if s.specialty == specialty), None)
        cap = h.capacity
        result.append(HospitalCandidate(
            id=h.id, name=h.name, address=h.address,
            latitude=h.latitude, longitude=h.longitude,
            general_beds=cap.general_beds_available if cap else None,
            icu_beds=cap.icu_beds_available if cap else None,
            capacity_updated_at=cap.updated_at if cap else None,
            has_specialty=spec is not None,
            specialist_available=bool(spec and spec.specialist_available),
        ))
    return result
