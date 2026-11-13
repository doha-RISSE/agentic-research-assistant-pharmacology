"""Local retrieval tools. Tool selection remains the LLM's responsibility."""
from __future__ import annotations

import json
import re
from typing import Any

from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field

from app.retrieval.retriever import InMemoryRetriever


class CorpusSearchInput(BaseModel):
    query: str = Field(description="Precise pharmacology fact to find in the supplied medication corpus.")
    medication_ids: list[str] | None = Field(
        default=None,
        description="Optional exact medication IDs from the supplied allowed list. Use all relevant IDs for comparisons.",
    )
    exhaustive_if_empty: bool = Field(
        default=False,
        description="Set true only for a Critic-requested follow-up check for potentially missing information.",
    )


class GlossarySearchInput(BaseModel):
    query: str = Field(description="Technical pharmacology term or abbreviation requiring a corpus glossary definition.")


def _glossary_matches(markdown: str, query: str) -> list[str]:
    tokens = set(re.findall(r"[a-z0-9]+", query.lower()))
    entries = [line.strip() for line in markdown.splitlines() if line.lstrip().startswith("-")]
    ranked = sorted(
        entries,
        key=lambda line: len(tokens & set(re.findall(r"[a-z0-9]+", line.lower()))),
        reverse=True,
    )
    return [entry for entry in ranked if tokens & set(re.findall(r"[a-z0-9]+", entry.lower()))][:6]


def build_tools(retriever: InMemoryRetriever, glossary_path: str) -> list[StructuredTool]:
    medication_ids = ", ".join(retriever.medication_ids)
    glossary = open(glossary_path, encoding="utf-8").read()

    def search_medication_corpus(
        query: str, medication_ids: list[str] | None = None, exhaustive_if_empty: bool = False
    ) -> str:
        """Search medication label and public-information chunks using cosine similarity."""
        result = retriever.search(query, medication_ids, exhaustive_if_empty)
        return json.dumps(result, ensure_ascii=False)

    def search_glossary(query: str) -> str:
        """Look up pharmacology terminology in the supplied GLOSSARY.md only."""
        matches = _glossary_matches(glossary, query)
        return json.dumps(
            {"query": query, "results": matches, "source_file": "GLOSSARY.md", "found": bool(matches)},
            ensure_ascii=False,
        )

    corpus_description = (
        "Search the local medication corpus for source-grounded drug information. "
        "Use this whenever the answer needs facts about a medication, safety, contraindications, interactions, "
        "monitoring, dosing, or indications. Choose medication_ids yourself when the question identifies drugs; "
        f"valid IDs are: {medication_ids}. Do not substitute an unknown ID. For a comparison pass every relevant ID, "
        "not just the first."
    )
    return [
        StructuredTool.from_function(
            func=search_medication_corpus,
            name="search_medication_corpus",
            description=corpus_description,
            args_schema=CorpusSearchInput,
        ),
        StructuredTool.from_function(
            func=search_glossary,
            name="search_glossary",
            description="Clarify a pharmacology term or abbreviation with the local GLOSSARY.md. "
            "Use it when a definition is needed; combine it with medication search when both definition and drug evidence are required.",
            args_schema=GlossarySearchInput,
        ),
    ]
