from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

APPROVED_SOURCES_PATH = Path(__file__).resolve().parents[2] / "data" / "approved_sources.json"


def load_approved_sources() -> dict:
    with APPROVED_SOURCES_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def is_approved_url(url: str) -> bool:
    domain = urlparse(url).netloc.lower()
    sources = load_approved_sources().get("sources", [])
    for source in sources:
        for allowed in source.get("allowed_domains", []):
            allowed = allowed.lower()
            if domain == allowed or domain.endswith(f".{allowed}"):
                return True
    return False
