from __future__ import annotations

from datetime import datetime
import re

KEYWORDS = {
    "closest approach": ("closest_approach", "Closest Approach", "confirmed", 0.99, None),
    "earthrise": ("earthrise_observed", "Earthrise Observed", "confirmed", 0.97, None),
    "earthset": ("earthset_observed", "Earthset Observed", "confirmed", 0.97, None),
    "communications blackout": ("communications_blackout_begin", "Communications Blackout", "confirmed", 0.98, None),
    "line-of-sight to earth was interrupted": (
        "communications_blackout_begin",
        "Communications Blackout",
        "derived",
        0.92,
        "Derived from official line-of-sight interruption wording rather than a normalized event label in the source.",
    ),
    "observation window concluded": (
        "observation_window_complete",
        "Observation Window Complete",
        "interpreted",
        0.83,
        "Interpretive summary based on official-source sequence. The source supports the phase completion, but this event title is normalized by the system.",
    ),
    "return phase": (
        "return_phase_begin",
        "Return Phase Begins",
        "derived",
        0.88,
        "Derived from official transition language indicating return-phase operations were underway.",
    ),
    "lunar flyby": ("lunar_flyby_begin", "Lunar Flyby", "interpreted", 0.80, "Interpretive summary based on official source phrasing."),
}

TIME_PATTERNS = [
    re.compile(r"\b(\d{1,2}:\d{2}\s?(?:UTC|utc))\b"),
    re.compile(r"\b([A-Z][a-z]+\s+\d{1,2},\s+\d{4})\b"),
]


def _normalize_event(candidate: tuple[str, str, str, float, str | None], text: str, published_at: datetime) -> dict:
    event_type, title, evidence_class, confidence, derivation_note = candidate
    return {
        "event_type": event_type,
        "title": title,
        "summary": text,
        "start_time": published_at,
        "evidence_class": evidence_class,
        "confidence": confidence,
        "derivation_note": derivation_note,
    }


def extract_candidate_events(excerpts: list[dict], published_at: datetime | None = None) -> list[dict]:
    events: list[dict] = []
    base_time = published_at or datetime.utcnow()
    seen: set[tuple[int, str]] = set()

    for excerpt in excerpts:
        text = excerpt["excerpt_text"]
        lower = text.lower()
        excerpt_index = excerpt["excerpt_index"]

        for needle, candidate in KEYWORDS.items():
            if needle in lower and (excerpt_index, candidate[0]) not in seen:
                payload = _normalize_event(candidate, text, base_time)
                payload["excerpt_index"] = excerpt_index
                payload["time_mentions"] = [m.group(1) for p in TIME_PATTERNS for m in p.finditer(text)]
                events.append(payload)
                seen.add((excerpt_index, candidate[0]))

        if "passed about" in lower and "miles above the lunar surface" in lower and (excerpt_index, "closest_approach") not in seen:
            payload = {
                "event_type": "closest_approach",
                "title": "Closest Approach",
                "summary": text,
                "start_time": base_time,
                "evidence_class": "confirmed",
                "confidence": 0.99,
                "derivation_note": None,
                "excerpt_index": excerpt_index,
                "time_mentions": [m.group(1) for p in TIME_PATTERNS for m in p.finditer(text)],
            }
            events.append(payload)
            seen.add((excerpt_index, "closest_approach"))

    return events
