from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, Float, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Mission(Base):
    __tablename__ = "missions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    agency: Mapped[str] = mapped_column(String, default="NASA")
    mission_type: Mapped[str] = mapped_column(String)
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String, index=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    documents: Mapped[list[SourceDocument]] = relationship(back_populates="mission")
    events: Mapped[list[Event]] = relationship(back_populates="mission")
    media_assets: Mapped[list[MediaAsset]] = relationship(back_populates="mission")


class SourceDocument(Base):
    __tablename__ = "source_documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    mission_id: Mapped[Optional[str]] = mapped_column(ForeignKey("missions.id"), nullable=True, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    title: Mapped[str] = mapped_column(String)
    source_type: Mapped[str] = mapped_column(String, index=True)
    source_url: Mapped[str] = mapped_column(String)
    publisher: Mapped[str] = mapped_column(String)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    checksum: Mapped[str] = mapped_column(String, index=True)
    raw_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    is_latest: Mapped[bool] = mapped_column(Boolean, default=True)

    mission: Mapped[Optional[Mission]] = relationship(back_populates="documents")
    excerpts: Mapped[list[SourceExcerpt]] = relationship(back_populates="document", cascade="all, delete-orphan")


class SourceExcerpt(Base):
    __tablename__ = "source_excerpts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    document_id: Mapped[str] = mapped_column(ForeignKey("source_documents.id"), index=True)
    excerpt_index: Mapped[int] = mapped_column(Integer)
    excerpt_text: Mapped[str] = mapped_column(Text)
    start_offset: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_offset: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_label: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    document: Mapped[SourceDocument] = relationship(back_populates="excerpts")
    evidence_links: Mapped[list[EvidenceLink]] = relationship(back_populates="excerpt", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    mission_id: Mapped[str] = mapped_column(ForeignKey("missions.id"), index=True)
    event_type: Mapped[str] = mapped_column(String, index=True)
    title: Mapped[str] = mapped_column(String)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    summary: Mapped[str] = mapped_column(Text)
    evidence_class: Mapped[str] = mapped_column(String, index=True)
    confidence: Mapped[float] = mapped_column(Float)
    derivation_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_payload: Mapped[dict] = mapped_column(JSON, default=dict)

    mission: Mapped[Mission] = relationship(back_populates="events")
    evidence_links: Mapped[list[EvidenceLink]] = relationship(back_populates="event", cascade="all, delete-orphan")


class EvidenceLink(Base):
    __tablename__ = "evidence_links"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    event_id: Mapped[str] = mapped_column(ForeignKey("events.id"), index=True)
    excerpt_id: Mapped[str] = mapped_column(ForeignKey("source_excerpts.id"), index=True)
    relation_type: Mapped[str] = mapped_column(String)
    support_strength: Mapped[float] = mapped_column(Float)

    event: Mapped[Event] = relationship(back_populates="evidence_links")
    excerpt: Mapped[SourceExcerpt] = relationship(back_populates="evidence_links")


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    mission_id: Mapped[Optional[str]] = mapped_column(ForeignKey("missions.id"), nullable=True, index=True)
    document_id: Mapped[Optional[str]] = mapped_column(ForeignKey("source_documents.id"), nullable=True)
    media_type: Mapped[str] = mapped_column(String, index=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_url: Mapped[str] = mapped_column(String)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    captured_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)

    mission: Mapped[Optional[Mission]] = relationship(back_populates="media_assets")
