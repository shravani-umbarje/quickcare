"""Synthetic demo data. Hospital names are FICTIONAL; coordinates are approximate
Mumbai-area points. Run:  python -m app.seed"""
from .database import Base, SessionLocal, engine
from .models import Hospital, HospitalCapacity, HospitalSpecialty, utcnow

# name, address, lat, lng, general_beds, icu_beds, {specialty: specialist_on_duty}
HOSPITALS = [
    ("Demo City Hospital", "Andheri West", 19.1364, 72.8296, 25, 4, {"general": True, "cardiology": True, "trauma": True, "pulmonology": True}),
    ("Demo Heart Institute", "Bandra", 19.0596, 72.8295, 12, 6, {"general": True, "cardiology": True}),
    ("Demo Neuro & Trauma Centre", "Dadar", 19.0178, 72.8478, 18, 3, {"general": True, "neurology": True, "trauma": True}),
    ("Demo Women's Hospital", "Juhu", 19.1075, 72.8263, 15, 2, {"general": True, "gynecology": True}),
    ("Demo General Hospital", "Kurla", 19.0726, 72.8845, 40, 0, {"general": True, "trauma": True, "pulmonology": False}),
    ("Demo Multispeciality Hospital", "Powai", 19.1197, 72.9051, 30, 8, {"general": True, "cardiology": False, "neurology": True, "gynecology": True, "pulmonology": True}),
    ("Demo Metro Hospital", "Borivali", 19.2307, 72.8567, 20, 5, {"general": True, "cardiology": True, "trauma": True, "neurology": True}),
    ("Demo Sea View Hospital", "Worli", 19.0176, 72.8170, 10, 1, {"general": True, "cardiology": True, "pulmonology": True}),
    ("Demo Community Clinic", "Malad", 19.1860, 72.8484, 8, 0, {"general": True}),
    ("Demo Central Hospital", "Thane", 19.2183, 72.9781, 35, 7, {"general": True, "cardiology": True, "neurology": True, "trauma": True, "gynecology": True, "pulmonology": True}),
]


def seed(db) -> int:
    if db.query(Hospital).count():
        return 0
    for name, addr, lat, lng, gb, icu, specs in HOSPITALS:
        h = Hospital(name=name, address=addr, latitude=lat, longitude=lng)
        h.capacity = HospitalCapacity(general_beds_available=gb, icu_beds_available=icu, updated_at=utcnow())
        h.specialties = [HospitalSpecialty(specialty=s, specialist_available=on) for s, on in specs.items()]
        db.add(h)
    db.commit()
    return len(HOSPITALS)


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        print(f"Seeded {seed(db)} hospitals")
