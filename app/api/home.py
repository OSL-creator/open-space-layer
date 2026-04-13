from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Mission
from app.db.schemas import HomeResponse, HomeMissionCard
from app.search.query import suggest_topics

router = APIRouter(prefix="/api", tags=["home"])


@router.get("/home", response_model=HomeResponse)
def home(db: Session = Depends(get_db)):
    missions = db.query(Mission).order_by(Mission.name.asc()).all()
    return HomeResponse(
        hero_title="Open Space Layer",
        hero_subtitle="Search official NASA mission evidence or enter through mission control.",
        suggested_topics=suggest_topics(db=db, q=""),
        missions=[
            HomeMissionCard(
                slug=m.slug,
                name=m.name,
                status=m.status,
                mission_type=m.mission_type,
                summary=m.summary,
            )
            for m in missions
        ],
    )
