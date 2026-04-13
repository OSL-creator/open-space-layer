from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.provenance import get_evidence_presentation
from app.db.session import get_db
from app.db.models import Mission, SourceDocument, Event, MediaAsset
from app.db.schemas import MissionOut, MissionDetailOut, EventOut, EvidencePresentationOut

router = APIRouter(prefix="/api/missions", tags=["missions"])


@router.get("", response_model=list[MissionOut])
def list_missions(db: Session = Depends(get_db)):
    return db.query(Mission).order_by(Mission.name.asc()).all()


@router.get("/{slug}", response_model=MissionDetailOut)
def get_mission(slug: str, db: Session = Depends(get_db)):
    mission = db.query(Mission).filter(Mission.slug == slug).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    documents_count = db.query(func.count(SourceDocument.id)).filter(SourceDocument.mission_id == mission.id).scalar() or 0
    events_count = db.query(func.count(Event.id)).filter(Event.mission_id == mission.id).scalar() or 0
    media_count = db.query(func.count(MediaAsset.id)).filter(MediaAsset.mission_id == mission.id).scalar() or 0

    return MissionDetailOut(
        **MissionOut.model_validate(mission).model_dump(),
        documents_count=documents_count,
        events_count=events_count,
        media_count=media_count,
    )


@router.get("/{slug}/timeline", response_model=list[EventOut])
def get_mission_timeline(
    slug: str,
    evidence_class: str | None = None,
    event_type: str | None = None,
    db: Session = Depends(get_db),
):
    mission = db.query(Mission).filter(Mission.slug == slug).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    q = db.query(Event).filter(Event.mission_id == mission.id)
    if evidence_class:
        q = q.filter(Event.evidence_class == evidence_class)
    if event_type:
        q = q.filter(Event.event_type == event_type)

    events = q.order_by(Event.start_time.asc()).all()
    out: list[EventOut] = []
    for event in events:
        payload = EventOut.model_validate(event)
        payload.evidence_presentation = EvidencePresentationOut(**get_evidence_presentation(event.evidence_class, event.derivation_note))
        out.append(payload)
    return out
