from __future__ import annotations

import argparse
from app.db.session import SessionLocal
from app.ingest.service import ingest_nasa_url


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest an approved NASA source URL into OSL.")
    parser.add_argument("url", help="NASA URL to ingest")
    parser.add_argument("--mission", default="artemis-ii", help="Mission slug")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        result = ingest_nasa_url(db, url=args.url, mission_slug=args.mission)
        print(result)
    finally:
        db.close()


if __name__ == "__main__":
    main()
