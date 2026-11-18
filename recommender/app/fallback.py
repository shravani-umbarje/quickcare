"""Deterministic fallback: nearest hospital with the required specialty.
Ignores capacity data entirely. Same input -> same output."""
from .categories import EmergencyCategory
from .scoring import ScoredHospital, haversine_km


def fallback_rank(candidates, cat: EmergencyCategory, lat: float, lng: float) -> list[ScoredHospital]:
    out = []
    for h in candidates:
        if not h.has_specialty:
            continue
        km = haversine_km(lat, lng, h.latitude, h.longitude)
        out.append(ScoredHospital(h, round(km, 2), 0.0,
                                  f"{km:.1f} km away, nearest with {cat.required_specialty} "
                                  f"(capacity data unavailable, rule-based fallback)"))
    return sorted(out, key=lambda s: (s.distance_km, s.hospital.id))
