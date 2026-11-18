import os
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from . import service
from .categories import CATEGORIES
from .database import get_db
from .models import Recommendation
from .schemas import RecommendationRequest, RecommendationResponse, EmergencyTypeOut


def require_api_key(x_api_key: str | None = Header(default=None)):
    """Placeholder auth. Replace with the team's agreed method (JWT/RBAC, reviewed by Samarth).
    Disabled when LIFELINE_API_KEY is not set (local demo)."""
    expected = os.getenv("LIFELINE_API_KEY")
    if expected and x_api_key != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


router = APIRouter(prefix="/api/v1", dependencies=[Depends(require_api_key)])


@router.get("/emergency-types", response_model=list[EmergencyTypeOut])
def emergency_types():
    return [EmergencyTypeOut(key=c.key, label=c.label, ambulance_type=c.ambulance_type,
                             required_specialty=c.required_specialty, needs_icu=c.needs_icu)
            for c in CATEGORIES.values()]


@router.post("/recommendations", response_model=RecommendationResponse, status_code=201)
def create_recommendation(body: RecommendationRequest, db: Session = Depends(get_db)):
    try:
        return service.recommend(db, body.emergency_type, body.latitude, body.longitude)
    except service.UnknownEmergencyType:
        raise HTTPException(status_code=422, detail={
            "error": "unknown_emergency_type",
            "message": f"'{body.emergency_type}' is not valid",
            "valid_types": list(CATEGORIES)})


@router.get("/recommendations/{rec_id}", response_model=RecommendationResponse)
def get_recommendation(rec_id: int, db: Session = Depends(get_db)):
    rec = db.get(Recommendation, rec_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return service.to_response(db, rec)
