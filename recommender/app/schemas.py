from datetime import datetime
from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    emergency_type: str = Field(examples=["cardiac"])
    latitude: float = Field(ge=-90, le=90, examples=[19.0760])
    longitude: float = Field(ge=-180, le=180, examples=[72.8777])


class HospitalOut(BaseModel):
    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    distance_km: float
    score: float
    reason: str


class RecommendationResponse(BaseModel):
    id: int
    emergency_type: str
    ambulance_type: str
    ambulance_type_label: str
    hospital: HospitalOut | None
    alternatives: list[HospitalOut]
    reason: str
    used_fallback: bool
    created_at: datetime


class EmergencyTypeOut(BaseModel):
    key: str
    label: str
    ambulance_type: str
    required_specialty: str
    needs_icu: bool
