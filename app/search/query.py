from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.provenance import get_evidence_presentation
from app.db.models import Event, SourceExcerpt, SourceDocument, Mission
from app.db.schemas import SearchItem, EvidencePresentationOut


def _score_text(query: str, title: str, snippet: str) -> float:
    query_terms = [t for t in query.lower().split() if t]
    haystack = f"{title} {snippet}".lower()
    score = 0.0
    for term in query_terms:
        if term in title.lower():
            score += 3.0
        if term in haystack:
            score += 1.0
    return score


def search_objects(
    db: Session,
    q: str,
    mission_slug: str | None = None,
    confirmed_only: bool = False,
    object_type: str | None = None,
    evidence_class: str | None = None,
) -> list[SearchItem]:
    results: list[SearchItem] = []

    mission_id = None
    if mission_slug:
        mission = db.query(Mission).filter(Mission.slug == mission_slug).first()
        if mission:
            mission_id = mission.id

    if object_type in (None, "event"):
        event_query = db.query(Event)
        if mission_id:
            event_query = event_query.filter(Event.mission_id == mission_id)
        if confirmed_only:
            event_query = event_query.filter(Event.evidence_class == "confirmed")
        if evidence_class:
            event_query = event_query.filter(Event.evidence_class == evidence_class)
        event_query = event_query.filter(or_(Event.title.ilike(f"%{q}%"), Event.summary.ilike(f"%{q}%")))

        for event in event_query.limit(25).all():
            results.append(
                SearchItem(
                    object_type="event",
                    id=event.id,
                    title=event.title,
                    snippet=event.summary[:240],
                    evidence_class=event.evidence_class,
                    evidence_presentation=EvidencePresentationOut(**get_evidence_presentation(event.evidence_class, event.derivation_note)),
                    timestamp=event.start_time,
                    score=_score_text(q, event.title, event.summary),
                    extra={"event_type": event.event_type},
                )
            )

    if object_type in (None, "excerpt", "document"):
        excerpt_query = (
            db.query(SourceExcerpt, SourceDocument, Mission)
            .join(SourceDocument, SourceExcerpt.document_id == SourceDocument.id)
            .outerjoin(Mission, SourceDocument.mission_id == Mission.id)
        )
        if mission_id:
            excerpt_query = excerpt_query.filter(SourceDocument.mission_id == mission_id)
        excerpt_query = excerpt_query.filter(
            or_(
                SourceExcerpt.excerpt_text.ilike(f"%{q}%"),
                SourceDocument.title.ilike(f"%{q}%")
            )
        )

        for excerpt, document, mission in excerpt_query.limit(25).all():
            obj_type = "document" if object_type == "document" else "excerpt"
            snippet = excerpt.excerpt_text[:240] if obj_type == "excerpt" else (document.raw_text or excerpt.excerpt_text)[:240]
            title = document.title
            results.append(
                SearchItem(
                    object_type=obj_type,
                    id=document.id if obj_type == "document" else excerpt.id,
                    title=title,
                    snippet=snippet,
                    mission_slug=mission.slug if mission else None,
                    source_type=document.source_type,
                    timestamp=document.published_at,
                    score=_score_text(q, title, snippet),
                    extra={"document_id": document.id, "excerpt_index": excerpt.excerpt_index},
                )
            )

    results.sort(key=lambda r: (-r.score, 0 if r.object_type == "event" else 1, r.title.lower()))
    return results[:20]


def suggest_topics(db: Session, q: str, mission_slug: str | None = None) -> list[str]:
    q_lower = q.lower().strip()
    event_titles = [row[0] for row in db.query(Event.title).limit(50).all()]
    static_topics = [
        "communications blackout",
        "closest approach",
        "Earthrise",
        "Earthset",
        "lunar flyby",
        "official imagery",
        "DSN link state",
        "Orion spacecraft",
        "flight day updates",
        "derived evidence",
    ]
    merged = list(dict.fromkeys(event_titles + static_topics))
    ranked = sorted(merged, key=lambda t: (0 if q_lower and q_lower in t.lower() else 1, len(t)))
    return ranked[:6]
