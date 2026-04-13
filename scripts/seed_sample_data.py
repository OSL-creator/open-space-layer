from __future__ import annotations

import hashlib
from datetime import datetime, timezone

from app.db.session import Base, engine, SessionLocal
from app.db.models import Mission, SourceDocument, SourceExcerpt, Event, EvidenceLink, MediaAsset
from app.ingest.parser import create_excerpts

ARTEMIS_TEXT = """
NASA’s Artemis II mission is the first crewed mission under Artemis and will send four astronauts around the Moon aboard Orion.
During the lunar flyby, Orion passed behind the Moon, creating a planned communications blackout as line-of-sight to Earth was interrupted.
The crew observed Earthset as Orion moved behind the Moon.
At closest approach, Orion passed about 4,067 miles above the lunar surface.
After the blackout window, the crew observed Earthrise as communications were re-established.
The observation window concluded and the return phase continued toward Earth.
""".strip()


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Mission).filter(Mission.slug == "artemis-ii").first():
            print("Sample data already present.")
            return

        mission = Mission(
            slug="artemis-ii",
            name="Artemis II",
            agency="NASA",
            mission_type="crewed lunar flyby",
            start_time=datetime(2026, 4, 2, 0, 0, tzinfo=timezone.utc),
            status="completed",
            summary="Seed Artemis II dataset for OSL starter project.",
        )
        db.add(mission)
        db.flush()

        checksum = hashlib.sha256(ARTEMIS_TEXT.encode("utf-8")).hexdigest()
        document = SourceDocument(
            mission_id=mission.id,
            slug="artemis-ii-flight-day-seed",
            title="Artemis II Flight Day Seed Update",
            source_type="blog_post",
            source_url="https://www.nasa.gov/example/artemis-ii-flight-day-seed",
            publisher="NASA",
            published_at=datetime(2026, 4, 6, 19, 0, tzinfo=timezone.utc),
            checksum=checksum,
            raw_text=ARTEMIS_TEXT,
            metadata_json={"seed": True},
        )
        db.add(document)
        db.flush()

        excerpt_models = []
        for excerpt in create_excerpts(ARTEMIS_TEXT):
            model = SourceExcerpt(document_id=document.id, **excerpt)
            db.add(model)
            excerpt_models.append(model)
        db.flush()

        event_specs = [
            (
                "communications_blackout_begin",
                "Communications Blackout",
                "confirmed",
                0.98,
                None,
                1,
            ),
            (
                "earthset_observed",
                "Earthset Observed",
                "confirmed",
                0.97,
                None,
                2,
            ),
            (
                "closest_approach",
                "Closest Approach",
                "confirmed",
                0.99,
                None,
                3,
            ),
            (
                "earthrise_observed",
                "Earthrise Observed",
                "confirmed",
                0.97,
                None,
                4,
            ),
            (
                "observation_window_complete",
                "Observation Window Complete",
                "interpreted",
                0.83,
                "Interpretive summary based on official-source sequence. The source supports the phase completion, but this event title is normalized by the system.",
                5,
            ),
        ]

        event_time = datetime(2026, 4, 6, 19, 0, tzinfo=timezone.utc)
        for event_type, title, evidence_class, confidence, derivation_note, excerpt_index in event_specs:
            excerpt = excerpt_models[excerpt_index]
            event = Event(
                mission_id=mission.id,
                event_type=event_type,
                title=title,
                start_time=event_time,
                summary=excerpt.excerpt_text,
                evidence_class=evidence_class,
                confidence=confidence,
                derivation_note=derivation_note,
                raw_payload={"seed": True},
            )
            db.add(event)
            db.flush()
            db.add(
                EvidenceLink(
                    event_id=event.id,
                    excerpt_id=excerpt.id,
                    relation_type="supports",
                    support_strength=confidence,
                )
            )

        media = MediaAsset(
            mission_id=mission.id,
            document_id=document.id,
            media_type="image",
            title="Artemis II Earthrise placeholder",
            description="Seed media record for starter project wiring.",
            source_url="https://www.nasa.gov/example/artemis-ii-earthrise-image",
            published_at=datetime(2026, 4, 6, 20, 0, tzinfo=timezone.utc),
            metadata_json={"seed": True},
        )
        db.add(media)
        db.commit()
        print("Seeded Artemis II starter data.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
