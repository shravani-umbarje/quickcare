"""Emergency categories -> ambulance type + hospital needs.

ASSUMPTION: medical mapping is a reasonable first draft and must be reviewed
by a medical professional before real use. Documented in docs/evaluation.md.
Weights are (distance, beds, specialist) and sum to 1.
"""
from dataclasses import dataclass

AMBULANCE_TYPES = {
    "BASIC": "Basic Life Support (BLS)",
    "ALS": "Advanced Life Support (ALS)",
    "ICU_CARDIAC": "ICU / Cardiac Ambulance",
}


@dataclass(frozen=True)
class EmergencyCategory:
    key: str
    label: str
    ambulance_type: str
    required_specialty: str
    needs_icu: bool
    w_distance: float
    w_beds: float
    w_specialist: float


_CATEGORIES = [
    EmergencyCategory("cardiac", "Cardiac / chest pain", "ICU_CARDIAC", "cardiology", True, 0.30, 0.25, 0.45),
    EmergencyCategory("stroke", "Stroke", "ALS", "neurology", True, 0.35, 0.20, 0.45),
    EmergencyCategory("trauma", "Accident / trauma", "ALS", "trauma", True, 0.40, 0.25, 0.35),
    EmergencyCategory("pregnancy", "Pregnancy / delivery", "ALS", "gynecology", False, 0.40, 0.20, 0.40),
    EmergencyCategory("breathing", "Breathing difficulty", "ALS", "pulmonology", True, 0.35, 0.25, 0.40),
    EmergencyCategory("minor", "Minor injury / fever", "BASIC", "general", False, 0.60, 0.25, 0.15),
]

CATEGORIES = {c.key: c for c in _CATEGORIES}
