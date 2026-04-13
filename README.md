# Open Space Layer (OSL) Starter Project v0.2

A provenance-first, NASA-only mission intelligence starter backend for Artemis II.

## What this includes
- FastAPI backend
- SQLAlchemy models for missions, source documents, excerpts, events, evidence links, and media assets
- SQLite by default for zero-friction local startup
- Optional Postgres via `DATABASE_URL`
- Seed script with Artemis II sample data
- NASA ingestion skeleton with approved-source guardrails
- Hybrid search over events and excerpt-level evidence
- Derivation-aware evidence presentation fields for the UI
- Split-entry homepage payload for a mission-control + search landing experience

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed_sample_data.py
uvicorn app.main:app --reload
```

Open:
- API root: `http://127.0.0.1:8000/`
- Docs: `http://127.0.0.1:8000/docs`

## Environment
By default, the app uses SQLite at `./osl.db`.

To use Postgres later:

```bash
export DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/osl
```

## Current API
- `GET /` health/info
- `GET /api/home`
- `GET /api/missions`
- `GET /api/missions/{slug}`
- `GET /api/missions/{slug}/timeline`
- `GET /api/events/{event_id}`
- `GET /api/documents/{document_id}`
- `GET /api/search?q=...`
- `GET /api/suggestions?q=...`

## Search filters
- `mission`
- `confirmed_only`
- `object_type=event|excerpt|document`
- `evidence_class=confirmed|derived|interpreted|unresolved`

## Approved NASA ingestion
You can ingest an approved NASA URL into the local database:

```bash
python scripts/ingest_nasa_url.py "https://www.nasa.gov/..."
```

Guardrails:
- NASA-only domain allowlist
- excerpt-level evidence creation
- candidate event extraction from official text

## Evidence classes
- `confirmed`
- `derived`
- `interpreted`
- `unresolved`

For derived and interpreted items, the API returns `evidence_presentation`, including a disclosure title and note so the UI can render `*` and `**` states cleanly.

## Notes
This starter is intentionally conservative:
- NASA-only
- read-only public model
- excerpt-level evidence
- no public contribution path

It is still a starter. Vector search, live mission replay, source versioning, and the full frontend are the next layer.
