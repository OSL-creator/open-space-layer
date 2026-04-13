from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import Base, engine
from app.api.home import router as home_router
from app.api.missions import router as missions_router
from app.api.events import router as events_router
from app.api.documents import router as documents_router
from app.api.search import router as search_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Open Space Layer Starter", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home_router)
app.include_router(missions_router)
app.include_router(events_router)
app.include_router(documents_router)
app.include_router(search_router)


@app.get("/")
def root():
    return {
        "name": "Open Space Layer Starter",
        "status": "ok",
        "scope": "NASA-only",
        "mode": "read-only",
        "seed_mission": "Artemis II",
        "version": "0.2.0",
        "entry_mode": "split",
    }
