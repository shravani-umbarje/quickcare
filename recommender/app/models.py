from datetime import datetime
from sqlalchemy import ForeignKey, String, Float, Integer, Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


from datetime import datetime, timezone

def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Hospital(Base):
    __tablename__ = "hospitals"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    address: Mapped[str] = mapped_column(String(300), default="")
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    capacity: Mapped["HospitalCapacity"] = relationship(back_populates="hospital", uselist=False)
    specialties: Mapped[list["HospitalSpecialty"]] = relationship(back_populates="hospital")


class HospitalCapacity(Base):
    __tablename__ = "hospital_capacity"
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), primary_key=True)
    general_beds_available: Mapped[int] = mapped_column(Integer, default=0)
    icu_beds_available: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    hospital: Mapped[Hospital] = relationship(back_populates="capacity")


class HospitalSpecialty(Base):
    __tablename__ = "hospital_specialties"
    __table_args__ = (UniqueConstraint("hospital_id", "specialty"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), index=True)
    specialty: Mapped[str] = mapped_column(String(50), index=True)
    specialist_available: Mapped[bool] = mapped_column(Boolean, default=True)
    hospital: Mapped[Hospital] = relationship(back_populates="specialties")


class Recommendation(Base):
    __tablename__ = "recommendations"
    id: Mapped[int] = mapped_column(primary_key=True)
    emergency_type: Mapped[str] = mapped_column(String(50))
    patient_lat: Mapped[float] = mapped_column(Float)
    patient_lng: Mapped[float] = mapped_column(Float)
    ambulance_type: Mapped[str] = mapped_column(String(50))
    chosen_hospital_id: Mapped[int | None] = mapped_column(ForeignKey("hospitals.id"), nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    reason: Mapped[str] = mapped_column(Text)
    alternatives_json: Mapped[str] = mapped_column(Text, default="[]")
    used_fallback: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
