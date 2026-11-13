"""Loader for the supplied JSONL chunks; it never re-chunks source documents."""
from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class Chunk:
    chunk_id: str
    medication_id: str
    medication: str
    source_file: str
    header_path: str
    section_title: str
    text: str


def load_chunks(path: Path) -> list[Chunk]:
    if not path.is_file():
        raise FileNotFoundError(f"Chunks file not found: {path}")
    chunks: list[Chunk] = []
    with path.open(encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            try:
                raw = json.loads(line)
                chunks.append(Chunk(**{key: raw.get(key, "") for key in Chunk.__dataclass_fields__}))
            except (json.JSONDecodeError, TypeError) as exc:
                raise ValueError(f"Invalid chunk at {path}:{line_number}") from exc
    if not chunks:
        raise ValueError(f"No chunks found in {path}")
    return chunks
