from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from app.db.models import Mission, SourceDocument, SourceExcerpt, Event, EvidenceLink
from app.ingest.approval import is_approved_url
from app.ingest.nasa_blog import fetch_nasa_blog
from app.ingest.parser import create_excerpts
from app.extract.events import extract_candidate_events


def slugify(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "-" for ch in value)
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned.strip("-")[:120]


def infer_source_type(url: str) -> str:
    path = urlparse(url).path.lower()
    if "blog" in path:
        return "blog_post"
    if path.endswith(".pdf"):
        return "pdf"
    if "video" in path:
        return "video_release"
    if "image" in path or "multimedia" in path:
        return "image_release"
    return "status_page"


def ingest_nasa_url(db: Session, url: str, mission_slug: str = "artemis-ii") -> dict:
    if not is_approved_url(url):
        raise ValueError("URL is outside the approved NASA-only source boundary.")

    mission = db.query(Mission).filter(Mission.slug == mission_slug).first()
    if not mission:
        raise ValueError(f"Mission '{mission_slug}' was not found.")

    fetched = fetch_nasa_blog(url)
    checksum = fetched.checksum or hashlib.sha256(fetched.text.encode("utf-8")).hexdigest()

    existing = db.query(SourceDocument).filter(SourceDocument.checksum == checksum).first()
    if existing:
        return {"status": "duplicate", "document_id": existing.id, "title": existing.title}

    document = SourceDocument(
        mission_id=mission.id,
        slug=slugify(fetched.title),
        title=fetched.title,
        source_type=infer_source_type(url),
        source_url=url,
        publisher="NASA",
        published_at=datetime.now(timezone.utc),
        checksum=checksum,
        raw_text=fetched.text,
        metadata_json={**fetched.metadata, "ingested_from": url},
    )
    db.add(document)
    db.flush()

    excerpt_models = []
    for excerpt in create_excerpts(fetched.text):
        model = SourceExcerpt(document_id=document.id, **excerpt)
        db.add(model)
        excerpt_models.append(model)
    db.flush()

    candidates = extract_candidate_events([{
        "excerpt_index": ex.excerpt_index,
        "excerpt_text": ex.excerpt_text,
        "start_offset": ex.start_offset,
        "end_offset": ex.end_offset,
    } for ex in excerpt_models], published_at=document.published_at)

    created_events = 0
    for candidate in candidates:
        excerpt = next((ex for ex in excerpt_models if ex.excerpt_index == candidate["excerpt_index"]), None)
        if not excerpt:
            continue
        event = Event(
            mission_id=mission.id,
            event_type=candidate["event_type"],
            title=candidate["title"],
            start_time=candidate["start_time"],
            summary=candidate["summary"],
            evidence_class=candidate["evidence_class"],
            confidence=candidate["confidence"],
            derivation_note=candidate.get("derivation_note"),
            raw_payload={"ingested": True, "source_url": url},
        )
        db.add(event)
        db.flush()
        db.add(EvidenceLink(event_id=event.id, excerpt_id=excerpt.id, relation_type="supports", support_strength=candidate["confidence"]))
        created_events += 1

    db.commit()
    return {
        "status": "ingested",
        "document_id": document.id,
        "title": document.title,
        "excerpt_count": len(excerpt_models),
        "created_events": created_events,
    }
