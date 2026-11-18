from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import router
from fastapi.responses import RedirectResponse


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lifeline Emergency Recommendation Service", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])  # tighten later
app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse("/docs")
