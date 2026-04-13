from __future__ import annotations

import hashlib
from dataclasses import dataclass
from bs4 import BeautifulSoup
import requests


@dataclass
class FetchedDocument:
    title: str
    text: str
    checksum: str
    metadata: dict


def fetch_nasa_blog(url: str, timeout: int = 30) -> FetchedDocument:
    response = requests.get(url, timeout=timeout)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    title_node = soup.find("h1")
    title = title_node.get_text(" ", strip=True) if title_node else url

    paragraphs = [p.get_text(" ", strip=True) for p in soup.find_all("p")]
    text = "\n".join([p for p in paragraphs if p])
    checksum = hashlib.sha256(text.encode("utf-8")).hexdigest()

    return FetchedDocument(
        title=title,
        text=text,
        checksum=checksum,
        metadata={"source_url": url},
    )
