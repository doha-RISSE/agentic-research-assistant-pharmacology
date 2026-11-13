"""In-memory cosine retrieval with traceable progressive exhaustive search."""
from __future__ import annotations

from dataclasses import asdict
from typing import Iterable

import numpy as np
from openai import OpenAI

from app.config import Settings
from app.retrieval.loader import Chunk, load_chunks


class InMemoryRetriever:
    """Embeddings live only for the application process lifetime."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)
        self.chunks: list[Chunk] = []
        self.vectors: np.ndarray | None = None

    @property
    def medication_ids(self) -> list[str]:
        return sorted({chunk.medication_id for chunk in self.chunks})

    @property
    def ready(self) -> bool:
        return self.vectors is not None

    def initialize(self) -> None:
        self.chunks = load_chunks(self.settings.chunks_path)
        vectors: list[list[float]] = []
        # Batching keeps startup request sizes predictable for OpenAI-compatible proxies.
        for offset in range(0, len(self.chunks), 96):
            texts = [chunk.text for chunk in self.chunks[offset : offset + 96]]
            response = self.client.embeddings.create(model=self.settings.embedding_model, input=texts)
            vectors.extend(item.embedding for item in response.data)
        matrix = np.asarray(vectors, dtype=np.float32)
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        self.vectors = matrix / np.clip(norms, 1e-12, None)

    def _embed_query(self, query: str) -> np.ndarray:
        response = self.client.embeddings.create(model=self.settings.embedding_model, input=[query])
        vector = np.asarray(response.data[0].embedding, dtype=np.float32)
        return vector / max(float(np.linalg.norm(vector)), 1e-12)

    def search(
        self,
        query: str,
        medication_ids: list[str] | None = None,
        exhaustive_if_empty: bool = False,
        limit: int = 8,
    ) -> dict:
        if not self.ready or self.vectors is None:
            raise RuntimeError("Retriever is still initializing. Please retry shortly.")
        requested_ids = [item.upper() for item in medication_ids or []]
        unknown_ids = sorted(set(requested_ids) - set(self.medication_ids))
        allowed = np.array(
            [not requested_ids or chunk.medication_id in requested_ids for chunk in self.chunks], dtype=bool
        )
        candidate_indices = np.flatnonzero(allowed)
        if candidate_indices.size == 0:
            return {
                "query": query, "results": [],
                "status": {"threshold_used": self.settings.similarity_threshold, "found": False,
                           "exhaustive": False, "candidate_count": 0, "unknown_medication_ids": unknown_ids},
            }
        scores = self.vectors[candidate_indices] @ self._embed_query(query)
        # The last stage is deliberately -1: every candidate in the active filter is examined.
        thresholds: Iterable[float] = sorted(
            {self.settings.similarity_threshold, 0.2, 0.0, -0.25, -1.0}, reverse=True
        )
        threshold_used = self.settings.similarity_threshold
        result_positions = np.flatnonzero(scores >= threshold_used)
        if exhaustive_if_empty and result_positions.size == 0:
            for threshold in thresholds:
                threshold_used = threshold
                result_positions = np.flatnonzero(scores >= threshold)
                if result_positions.size or threshold == -1.0:
                    break
        ordered = result_positions[np.argsort(scores[result_positions])[::-1]][:limit]
        results = []
        for position in ordered:
            chunk = self.chunks[int(candidate_indices[position])]
            item = asdict(chunk)
            item["score"] = round(float(scores[position]), 6)
            results.append(item)
        return {
            "query": query,
            "results": results,
            "status": {
                "threshold_used": threshold_used,
                "found": bool(results),
                "exhaustive": threshold_used == -1.0,
                "candidate_count": int(candidate_indices.size),
                "unknown_medication_ids": unknown_ids,
            },
        }
