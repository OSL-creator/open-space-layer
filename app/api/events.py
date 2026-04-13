from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.provenance import get_evidence_presentation
from app.db.session import get_db
from app.db.models import Event, EvidenceLink
from app.db.schemas import EventDetailOut, EvidencePresentationOut

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/{event_id}", response_model=EventDetailOut)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = (
        db.query(Event)
        .options(joinedload(Event.evidence_links).joinedload(EvidenceLink.excerpt))
        .filter(Event.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    payload = EventDetailOut.model_validate(event)
    payload.evidence_presentation = EvidencePresentationOut(**get_evidence_presentation(event.evidence_class, event.derivation_note))
    return payload
