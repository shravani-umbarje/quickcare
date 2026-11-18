from datetime import datetime
from app.categories import CATEGORIES
from app.scoring import HospitalCandidate, haversine_km, rank_hospitals, passes_hard_filters
from app.fallback import fallback_rank

NOW = datetime.utcnow()


def cand(id, lat, lng, gb=10, icu=5, spec=True, on_duty=True):
    return HospitalCandidate(id, f"H{id}", "", lat, lng, gb, icu, NOW, spec, on_duty)


def test_haversine_zero_and_known_distance():
    assert haversine_km(19, 72, 19, 72) == 0
    assert 110 < haversine_km(19, 72, 20, 72) < 112  # ~1 degree latitude


def test_icu_required_excludes_zero_icu():
    cat = CATEGORIES["cardiac"]
    assert not passes_hard_filters(cand(1, 19, 72, icu=0), cat)
    assert passes_hard_filters(cand(1, 19, 72, icu=1), cat)


def test_missing_specialty_excluded():
    assert not passes_hard_filters(cand(1, 19, 72, spec=False), CATEGORIES["cardiac"])


def test_closer_hospital_wins_when_equal_otherwise():
    near, far = cand(1, 19.00, 72.0), cand(2, 19.20, 72.0)
    ranked = rank_hospitals([far, near], CATEGORIES["cardiac"], 19.0, 72.0)
    assert [r.hospital.id for r in ranked] == [1, 2]


def test_specialist_on_duty_beats_slightly_closer():
    off, on = cand(1, 19.00, 72.0, on_duty=False), cand(2, 19.03, 72.0, on_duty=True)
    ranked = rank_hospitals([off, on], CATEGORIES["cardiac"], 19.0, 72.0)
    assert ranked[0].hospital.id == 2


def test_deterministic_tie_break_by_id():
    a, b = cand(2, 19.0, 72.0), cand(1, 19.0, 72.0)
    assert [r.hospital.id for r in rank_hospitals([a, b], CATEGORIES["cardiac"], 19, 72)] == [1, 2]


def test_no_candidates_returns_empty():
    assert rank_hospitals([], CATEGORIES["cardiac"], 19, 72) == []


def test_fallback_ignores_capacity_picks_nearest():
    full_near = cand(1, 19.01, 72.0, icu=0)
    open_far = cand(2, 19.20, 72.0)
    assert fallback_rank([open_far, full_near], CATEGORIES["cardiac"], 19.0, 72.0)[0].hospital.id == 1
