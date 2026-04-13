from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class EvidencePresentation:
    evidence_class: str
    marker: str
    label: str
    disclosure_title: Optional[str]
    disclosure_note: Optional[str]


EVIDENCE_MAP = {
    "confirmed": EvidencePresentation(
        evidence_class="confirmed",
        marker="",
        label="Confirmed",
        disclosure_title=None,
        disclosure_note=None,
    ),
    "derived": EvidencePresentation(
        evidence_class="derived",
        marker="*",
        label="Derived*",
        disclosure_title="How this was derived",
        disclosure_note="Derived from official data and system analysis.",
    ),
    "interpreted": EvidencePresentation(
        evidence_class="interpreted",
        marker="**",
        label="Interpreted**",
        disclosure_title="Interpretive summary",
        disclosure_note="Interpretive summary based on official sources.",
    ),
    "unresolved": EvidencePresentation(
        evidence_class="unresolved",
        marker="?",
        label="Unresolved",
        disclosure_title="Evidence state",
        disclosure_note="Official evidence is incomplete, conflicting, or ambiguous.",
    ),
}


def get_evidence_presentation(evidence_class: str, derivation_note: Optional[str] = None) -> dict:
    presentation = EVIDENCE_MAP.get(evidence_class, EVIDENCE_MAP["unresolved"])
    return {
        "evidence_class": presentation.evidence_class,
        "display_label": presentation.label,
        "display_marker": presentation.marker,
        "disclosure_title": presentation.disclosure_title,
        "disclosure_note": derivation_note or presentation.disclosure_note,
    }
