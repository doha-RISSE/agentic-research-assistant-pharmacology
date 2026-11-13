"""FastAPI entry point and lifecycle for the local pharmacology agent."""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.config import Settings
from app.graph import create_graph
from app.retrieval.retriever import InMemoryRetriever

logger = logging.getLogger(__name__)
FRONTEND_FILE = Path("frontend/index.html")


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=4_000)


class AskResponse(BaseModel):
    answer: str
    sources: list[str]
    scope: str
    trace: list[dict[str, Any]]


class Runtime:
    status: str = "starting"
    error: str | None = None
    graph: Any = None


runtime = Runtime()


async def _initialize_runtime() -> None:
    try:
        settings = Settings.from_environment()
        retriever = InMemoryRetriever(settings)
        await asyncio.to_thread(retriever.initialize)
        runtime.graph = create_graph(settings, retriever)
        runtime.status = "ready"
        logger.info("Retriever initialized with %d chunks and %d medication IDs", len(retriever.chunks), len(retriever.medication_ids))
    except Exception as exc:  # surfaced by health/ask rather than hiding startup failures
        runtime.status = "error"
        runtime.error = str(exc)
        logger.exception("Agent runtime initialization failed")


@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(_initialize_runtime())
    yield
    task.cancel()


app = FastAPI(title="Pharmacology Research Agent", version="0.1.0", lifespan=lifespan)


@app.get("/", include_in_schema=False)
async def frontend() -> FileResponse:
    return FileResponse(FRONTEND_FILE)


@app.get("/health")
async def health() -> dict[str, str]:
    """Always responds quickly, including while embeddings are being calculated."""
    response = {"status": runtime.status}
    if runtime.error:
        response["detail"] = runtime.error
    return response


@app.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest) -> AskResponse:
    if runtime.status != "ready" or runtime.graph is None:
        detail = runtime.error or "The corpus index is still initializing. Retry shortly."
        raise HTTPException(status_code=503, detail=detail)
    try:
        state = await asyncio.to_thread(runtime.graph.invoke, {"question": payload.question, "critic_iterations": 0})
    except Exception as exc:
        logger.exception("Graph execution failed")
        raise HTTPException(status_code=502, detail=f"The research agent could not complete this request: {exc}") from exc
    return AskResponse(
        answer=state["final_answer"],
        sources=state.get("source_files", []),
        scope=state.get("scope", "out_of_scope"),
        trace=state.get("trace", []),
    )
