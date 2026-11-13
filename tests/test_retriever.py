from pathlib import Path

import numpy as np

from app.config import Settings
from app.retrieval.loader import Chunk
from app.retrieval.retriever import InMemoryRetriever


def _settings() -> Settings:
    return Settings("x", "https://example.invalid", "test", "embed", 0.39726812, 2, Path("chunks.jsonl"), Path("corpus/GLOSSARY.md"))


def test_multi_medication_filter_keeps_every_requested_medication(monkeypatch):
    retriever = InMemoryRetriever(_settings())
    retriever.chunks = [
        Chunk("w", "WARFARIN", "Warfarin", "dailymed-warfarin.md", "/", "x", "warfarin"),
        Chunk("a", "APIXABAN", "Apixaban", "dailymed-apixaban.md", "/", "x", "apixaban"),
        Chunk("m", "METFORMIN", "Metformin", "dailymed-metformin.md", "/", "x", "metformin"),
    ]
    retriever.vectors = np.array([[1.0, 0.0], [0.9, 0.1], [0.0, 1.0]], dtype=np.float32)
    monkeypatch.setattr(retriever, "_embed_query", lambda _: np.array([1.0, 0.0], dtype=np.float32))

    result = retriever.search("contraindications", ["WARFARIN", "APIXABAN"])

    assert {row["medication_id"] for row in result["results"]} == {"WARFARIN", "APIXABAN"}
    assert result["status"]["candidate_count"] == 2


def test_empty_critic_follow_up_reaches_exhaustive_search(monkeypatch):
    retriever = InMemoryRetriever(_settings())
    retriever.chunks = [Chunk("w", "WARFARIN", "Warfarin", "dailymed-warfarin.md", "/", "x", "warfarin")]
    retriever.vectors = np.array([[-1.0, 0.0]], dtype=np.float32)
    monkeypatch.setattr(retriever, "_embed_query", lambda _: np.array([1.0, 0.0], dtype=np.float32))

    result = retriever.search("missing condition", ["WARFARIN"], exhaustive_if_empty=True)

    assert result["status"]["exhaustive"] is True
    assert result["status"]["threshold_used"] == -1.0
