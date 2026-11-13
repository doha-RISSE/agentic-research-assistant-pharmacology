"""Typed state passed through the LangGraph workflow."""
from __future__ import annotations

import operator
from typing import Annotated, Any, Literal, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict, total=False):
    question: str
    messages: Annotated[list[BaseMessage], add_messages]
    scope: Literal["in_scope", "out_of_scope"]
    scope_reason: str
    plan: list[str]
    evidence: list[dict[str, Any]]
    search_statuses: list[dict[str, Any]]
    source_files: list[str]
    draft: str
    final_answer: str
    critic: dict[str, Any]
    critic_iterations: int
    critic_request: str
    trace: Annotated[list[dict[str, Any]], operator.add]
