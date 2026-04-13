# Open Space Layer (OSL)

Open Space Layer is a provenance-first mission intelligence system for official NASA mission material. It is designed to make events, excerpts, documents, and media-backed mission moments searchable without breaking the source trail.

## v0.3 highlights
- split-entry public UI in `web/`
- homepage with search-first and mission-first entry points
- search results for events, excerpts, and documents
- event detail pages with supporting evidence excerpts
- document pages with official-source links and excerpt drill-down
- FastAPI backend mounted local UI at `/ui`
- `.gitignore` for Python cache and local database files

## Product rules
- NASA-only corpus for v0.x
- official-source-only ingestion
- read-only public experience
- derived views are explicitly labeled and disclosed
- no public contribution path

## Quick start

```bash
python -m venv .venv
```

Windows Command Prompt:
```bash
.venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Seed the sample database:
```bash
python scripts/seed_sample_data.py
```

Run the API:
```bash
uvicorn app.main:app --reload
```

Open:
- API docs: `http://127.0.0.1:8000/docs`
- local UI: `http://127.0.0.1:8000/ui/`

## Frontend structure
The static presentation layer lives in `web/` and is GitHub Pages-friendly.

Files:
- `web/index.html`
- `web/search.html`
- `web/mission.html`
- `web/event.html`
- `web/document.html`
- `web/styles.css`
- `web/app.js`
- `web/config.js`

### API base configuration
By default, the frontend uses the current origin when served locally by FastAPI and falls back to `http://127.0.0.1:8000` when opened from a GitHub Pages domain. Update `web/config.js` later when you deploy a public API.

## Important repo cleanup for the first push
Because the very first upload included local runtime artifacts, run this once in your repo before the next commit:

```bash
git rm -r --cached app/__pycache__ app/api/__pycache__ app/core/__pycache__ app/db/__pycache__ app/ingest/__pycache__ app/search/__pycache__
git rm --cached osl.db
```

Then commit the cleanup together with v0.3.

## Current architecture
- `app/` — FastAPI backend, data model, search, extraction, ingestion
- `scripts/` — seeding and ingestion utilities
- `data/` — source approval configuration
- `web/` — static frontend presentation layer

## Next targets
- real NASA page ingestion improvements
- richer event extraction
- evidence panel cross-links from documents to events
- deployable public API host to pair with GitHub Pages
