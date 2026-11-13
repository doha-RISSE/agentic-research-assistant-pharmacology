"""Configuration read exclusively from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

DEFAULT_THRESHOLD = 0.39726812


@dataclass(frozen=True, slots=True)
class Settings:
    openai_api_key: str
    openai_base_url: str
    openai_model: str
    embedding_model: str
    similarity_threshold: float
    max_critic_iterations: int
    chunks_path: Path
    glossary_path: Path

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv()
        required = {
            "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
            "OPENAI_BASE_URL": os.getenv("OPENAI_BASE_URL"),
            "OPENAI_MODEL": os.getenv("OPENAI_MODEL"),
            "OPENAI_EMBEDDING_MODEL": os.getenv("OPENAI_EMBEDDING_MODEL"),
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise RuntimeError(
                "Missing required environment variables: " + ", ".join(missing)
                + ". Copy .env.example to .env for local development."
            )
        try:
            threshold = float(os.getenv("SIMILARITY_THRESHOLD", str(DEFAULT_THRESHOLD)))
            iterations = int(os.getenv("MAX_CRITIC_ITERATIONS", "2"))
        except ValueError as exc:
            raise RuntimeError("SIMILARITY_THRESHOLD must be a float and MAX_CRITIC_ITERATIONS an integer.") from exc
        if not -1 <= threshold <= 1:
            raise RuntimeError("SIMILARITY_THRESHOLD must be between -1 and 1.")
        return cls(
            openai_api_key=required["OPENAI_API_KEY"],
            openai_base_url=required["OPENAI_BASE_URL"].rstrip("/"),
            openai_model=required["OPENAI_MODEL"],
            embedding_model=required["OPENAI_EMBEDDING_MODEL"],
            similarity_threshold=threshold,
            max_critic_iterations=max(0, iterations),
            chunks_path=Path(os.getenv("CHUNKS_PATH", "chunks.jsonl")),
            glossary_path=Path(os.getenv("GLOSSARY_PATH", "corpus/GLOSSARY.md")),
        )
