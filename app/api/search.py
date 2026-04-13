from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.search.query import search_objects, suggest_topics
from app.db.schemas import SearchResponse

router = APIRouter(prefix="/api", tags=["search"])


@router.get("/search", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1),
    mission: str | None = None,
    confirmed_only: bool = False,
    object_type: str | None = Query(None, pattern="^(event|excerpt|document)$"),
    evidence_class: str | None = Query(None, pattern="^(confirmed|derived|interpreted|unresolved)$"),
    db: Session = Depends(get_db),
):
    results = search_objects(
        db=db,
        q=q,
        mission_slug=mission,
        confirmed_only=confirmed_only,
        object_type=object_type,
        evidence_class=evidence_class,
    )
    return SearchResponse(query=q, total=len(results), results=results, suggestions=suggest_topics(db=db, q=q, mission_slug=mission))


@router.get("/suggestions", response_model=list[str])
def suggestions(q: str = Query(..., min_length=1), mission: str | None = None, db: Session = Depends(get_db)):
    return suggest_topics(db=db, q=q, mission_slug=mission)
