from __future__ import annotations

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel


class EvidencePresentationOut(BaseModel):
    evidence_class: str
    display_label: str
    display_marker: str
    disclosure_title: Optional[str] = None
    disclosure_note: Optional[str] = None


class ExcerptOut(BaseModel):
    id: str
    excerpt_index: int
    excerpt_text: str
    section_label: Optional[str] = None
    page_number: Optional[int] = None

    model_config = {"from_attributes": True}


class EvidenceLinkOut(BaseModel):
    relation_type: str
    support_strength: float
    excerpt: ExcerptOut

    model_config = {"from_attributes": True}


class EventOut(BaseModel):
    id: str
    event_type: str
    title: str
    start_time: datetime
    end_time: Optional[datetime] = None
    summary: str
    evidence_class: str
    confidence: float
    derivation_note: Optional[str] = None
    evidence_presentation: Optional[EvidencePresentationOut] = None

    model_config = {"from_attributes": True}


class EventDetailOut(EventOut):
    evidence_links: list[EvidenceLinkOut]


class DocumentOut(BaseModel):
    id: str
    slug: str
    title: str
    source_type: str
    source_url: str
    publisher: str
    published_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class DocumentDetailOut(DocumentOut):
    raw_text: Optional[str] = None
    excerpts: list[ExcerptOut]


class MissionOut(BaseModel):
    id: str
    slug: str
    name: str
    agency: str
    mission_type: str
    status: str
    summary: Optional[str] = None

    model_config = {"from_attributes": True}


class MissionDetailOut(MissionOut):
    documents_count: int
    events_count: int
    media_count: int


class SearchItem(BaseModel):
    object_type: str
    id: str
    title: str
    snippet: str
    mission_slug: Optional[str] = None
    evidence_class: Optional[str] = None
    evidence_presentation: Optional[EvidencePresentationOut] = None
    source_type: Optional[str] = None
    timestamp: Optional[datetime] = None
    score: float = 0.0
    extra: dict[str, Any] = {}


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchItem]
    suggestions: list[str]


class HomeMissionCard(BaseModel):
    slug: str
    name: str
    status: str
    mission_type: str
    summary: Optional[str] = None


class HomeResponse(BaseModel):
    hero_title: str
    hero_subtitle: str
    suggested_topics: list[str]
    missions: list[HomeMissionCard]
