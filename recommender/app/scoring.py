"""Pure functions: no DB, no I/O. Easy to unit test."""
from dataclasses import dataclass
from math import radians, sin, cos, asin, sqrt
from .categories import EmergencyCategory

MAX_DISTANCE_KM = 30.0   # beyond this distance_score is 0
BED_CAP = 10             # >= this many beds gets full bed score


@dataclass(frozen=True)
class HospitalCandidate:
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    general_beds: int | None      # None = capacity data missing
    icu_beds: int | None
    capacity_updated_at: object   # datetime | None
    has_specialty: bool
    specialist_available: bool


@dataclass(frozen=True)
class ScoredHospital:
    hospital: HospitalCandidate
    distance_km: float
    score: float
    reason: str


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    r = 6371.0088
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))


def distance_score(km: float) -> float:
    return max(0.0, 1.0 - km / MAX_DISTANCE_KM)


def bed_score(beds: int) -> float:
    return min(max(beds, 0) / BED_CAP, 1.0)


def passes_hard_filters(h: HospitalCandidate, cat: EmergencyCategory) -> bool:
    if not h.has_specialty:
        return False
    if h.general_beds is None or h.icu_beds is None:
        return False
    beds = h.icu_beds if cat.needs_icu else h.general_beds
    return beds > 0


def score_hospital(h: HospitalCandidate, cat: EmergencyCategory, lat: float, lng: float) -> ScoredHospital:
    km = haversine_km(lat, lng, h.latitude, h.longitude)
    beds = h.icu_beds if cat.needs_icu else h.general_beds
    spec = 1.0 if h.specialist_available else 0.0
    score = (cat.w_distance * distance_score(km)
             + cat.w_beds * bed_score(beds)
             + cat.w_specialist * spec)
    bed_label = "ICU beds" if cat.needs_icu else "beds"
    on_duty = f"{cat.required_specialty} specialist on duty" if h.specialist_available \
        else f"{cat.required_specialty} specialist not currently on duty"
    reason = f"{km:.1f} km away, {beds} {bed_label} available, {on_duty}"
    return ScoredHospital(h, round(km, 2), round(score, 4), reason)


def rank_hospitals(candidates, cat: EmergencyCategory, lat: float, lng: float) -> list[ScoredHospital]:
    scored = [score_hospital(h, cat, lat, lng) for h in candidates if passes_hard_filters(h, cat)]
    # deterministic: score desc, then distance asc, then id asc
    return sorted(scored, key=lambda s: (-s.score, s.distance_km, s.hospital.id))
