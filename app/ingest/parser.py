from __future__ import annotations


def create_excerpts(text: str) -> list[dict]:
    excerpts: list[dict] = []
    cursor = 0
    for i, block in enumerate([b.strip() for b in text.split("\n") if b.strip()]):
        start = cursor
        end = cursor + len(block)
        excerpts.append(
            {
                "excerpt_index": i,
                "excerpt_text": block,
                "start_offset": start,
                "end_offset": end,
            }
        )
        cursor = end + 1
    return excerpts
