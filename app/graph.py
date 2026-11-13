"""LangGraph Plan → Retrieve/Tools → Generate → Critic workflow."""
from __future__ import annotations

import json
import re
from typing import Any

from langchain_core.messages import AIMessage, SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from app.config import Settings
from app.prompts import CRITIC_PROMPT, GENERATOR_PROMPT, PLANNER_PROMPT, SCOPE_PROMPT, TOOL_SELECTION_PROMPT
from app.retrieval.retriever import InMemoryRetriever
from app.state import AgentState
from app.tools.search import build_tools

DISCLAIMER = "Ceci n’est pas un avis médical. Consultez un professionnel de santé pour toute décision de soins."


def _content(message: Any) -> str:
    content = getattr(message, "content", message)
    if isinstance(content, list):
        return "".join(str(part.get("text", "")) if isinstance(part, dict) else str(part) for part in content)
    return str(content)


def _json_object(value: str, fallback: dict[str, Any]) -> dict[str, Any]:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", value.strip(), flags=re.IGNORECASE)
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        return fallback
    try:
        result = json.loads(match.group())
        return result if isinstance(result, dict) else fallback
    except json.JSONDecodeError:
        return fallback


def _compact_evidence(evidence: list[dict[str, Any]]) -> str:
    if not evidence:
        return "No retrieved evidence. State this limitation rather than guessing."
    compact = []
    for item in evidence[:20]:
        item_copy = {key: value for key, value in item.items() if key != "text"}
        item_copy["text"] = item.get("text", "")[:3000]
        compact.append(item_copy)
    return json.dumps(compact, ensure_ascii=False)


def _render(template: str, **values: str) -> str:
    """Interpolate named prompt fields without interpreting JSON braces in prompts."""
    for name, value in values.items():
        template = template.replace("{" + name + "}", value)
    return template


def create_graph(settings: Settings, retriever: InMemoryRetriever):
    """Build a graph after retrieval has initialized, so tool IDs are accurate."""
    llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url,
        temperature=0,
    )
    tools = build_tools(retriever, str(settings.glossary_path))
    tool_llm = llm.bind_tools(tools)

    def scope(state: AgentState) -> dict:
        parsed = _json_object(
            _content(llm.invoke([SystemMessage(content=_render(SCOPE_PROMPT, question=state["question"]))])),
            {"scope": "out_of_scope", "reason": "Unable to safely classify the request."},
        )
        value = "in_scope" if parsed.get("scope") == "in_scope" else "out_of_scope"
        return {"scope": value, "scope_reason": str(parsed.get("reason", "")), "trace": [{"node": "scope", "scope": value}]}

    def plan(state: AgentState) -> dict:
        parsed = _json_object(
            _content(llm.invoke([SystemMessage(content=_render(PLANNER_PROMPT, question=state["question"]))])),
            {"plan": [state["question"]]},
        )
        steps = parsed.get("plan", [state["question"]])
        if not isinstance(steps, list) or not all(isinstance(item, str) for item in steps):
            steps = [state["question"]]
        return {"plan": steps[:6], "trace": [{"node": "planner", "plan": steps[:6]}]}

    def select_tools(state: AgentState) -> dict:
        prompt = _render(TOOL_SELECTION_PROMPT,
            question=state["question"], plan=json.dumps(state.get("plan", [])),
            critic_request=state.get("critic_request", ""),
        )
        result = tool_llm.invoke([SystemMessage(content=prompt)])
        return {"messages": [result], "trace": [{"node": "tool_selection", "tool_calls": [call["name"] for call in result.tool_calls]}]}

    def collect_evidence(state: AgentState) -> dict:
        prior = {item.get("chunk_id") for item in state.get("evidence", []) if item.get("chunk_id")}
        evidence = list(state.get("evidence", []))
        statuses = list(state.get("search_statuses", []))
        sources = set(state.get("source_files", []))
        calls = []
        for message in state.get("messages", []):
            if not isinstance(message, ToolMessage):
                continue
            calls.append(message.name)
            payload = _json_object(_content(message), {})
            if message.name == "search_medication_corpus":
                statuses.append(payload.get("status", {}))
                for result in payload.get("results", []):
                    if result.get("chunk_id") not in prior:
                        evidence.append(result)
                        prior.add(result.get("chunk_id"))
                        sources.add(result.get("source_file", ""))
            elif message.name == "search_glossary":
                for index, entry in enumerate(payload.get("results", [])):
                    key = f"glossary-{index}-{entry}"
                    if key not in prior:
                        evidence.append({"chunk_id": key, "source_file": "GLOSSARY.md", "text": entry})
                        prior.add(key)
                        sources.add("GLOSSARY.md")
        return {"evidence": evidence, "search_statuses": statuses, "source_files": sorted(filter(None, sources)),
                "trace": [{"node": "tools", "called": calls}]}

    def generate(state: AgentState) -> dict:
        prompt = _render(
            GENERATOR_PROMPT,
            question=state["question"],
            plan=json.dumps(state.get("plan", [])),
            critic_feedback=state.get("critic_request", ""),
            evidence=_compact_evidence(state.get("evidence", [])),
        )
        draft = _content(llm.invoke([SystemMessage(content=prompt)]))
        return {"draft": draft, "trace": [{"node": "generator"}]}

    def critic(state: AgentState) -> dict:
        prompt = _render(CRITIC_PROMPT,
            question=state["question"], draft=state.get("draft", ""), evidence=_compact_evidence(state.get("evidence", [])),
            statuses=json.dumps(state.get("search_statuses", [])),
        )
        parsed = _json_object(
            _content(llm.invoke([SystemMessage(content=prompt)])),
            {"verdict": "PASS", "grounding": "Critic response was unparseable; preserving grounded draft.", "follow_up": ""},
        )
        verdict = "FAIL" if parsed.get("verdict") == "FAIL" else "PASS"
        parsed["verdict"] = verdict
        follow_up = str(parsed.get("follow_up", ""))
        if verdict == "FAIL" and not follow_up:
            follow_up = "Revise the draft to address this critic feedback without inventing facts: " + \
                str(parsed.get("grounding", "")) + " " + str(parsed.get("unsupported_claims", "")) + " " + str(parsed.get("clinical_ambiguity", ""))
        return {"critic": parsed, "critic_request": follow_up if verdict == "FAIL" else "",
                "critic_iterations": state.get("critic_iterations", 0) + (1 if verdict == "FAIL" else 0),
                "trace": [{"node": "critic", "verdict": verdict}]}

    def finalise(state: AgentState) -> dict:
        sources = state.get("source_files", [])
        citations = "\n".join(f"- `{source}`" for source in sources) or "- No source passage was retrieved."
        return {"final_answer": f"{state.get('draft', '')}\n\nSources consulted:\n{citations}\n\n{DISCLAIMER}",
                "trace": [{"node": "finalise"}]}

    def out_of_scope(state: AgentState) -> dict:
        return {"final_answer": "Cette question ne relève pas du corpus pharmacologique local de cet agent. "
                "Je ne vais donc pas effectuer de recherche documentaire.\n\n" + DISCLAIMER,
                "source_files": [], "trace": [{"node": "out_of_scope"}]}

    def scope_route(state: AgentState) -> str:
        return "planning" if state["scope"] == "in_scope" else "out_of_scope"

    def after_selector(state: AgentState) -> str:
        last = state.get("messages", [])[-1] if state.get("messages") else None
        return "tool_execution" if isinstance(last, AIMessage) and last.tool_calls else "generator"

    def critic_route(state: AgentState) -> str:
        failed = state.get("critic", {}).get("verdict") == "FAIL" and bool(state.get("critic_request"))
        if failed and state.get("critic_iterations", 0) < settings.max_critic_iterations:
            return "select_tools"
        return "finalise"

    workflow = StateGraph(AgentState)
    # Node names intentionally differ from state keys (LangGraph reserves state-key names).
    workflow.add_node("scope_check", scope)
    workflow.add_node("planning", plan)
    workflow.add_node("select_tools", select_tools)
    workflow.add_node("tool_execution", ToolNode(tools))
    workflow.add_node("collect_evidence", collect_evidence)
    workflow.add_node("generator", generate)
    workflow.add_node("review", critic)
    workflow.add_node("finalise", finalise)
    workflow.add_node("out_of_scope", out_of_scope)
    workflow.add_edge(START, "scope_check")
    workflow.add_conditional_edges("scope_check", scope_route, {"planning": "planning", "out_of_scope": "out_of_scope"})
    workflow.add_edge("planning", "select_tools")
    workflow.add_conditional_edges("select_tools", after_selector, {"tool_execution": "tool_execution", "generator": "generator"})
    workflow.add_edge("tool_execution", "collect_evidence")
    workflow.add_edge("collect_evidence", "generator")
    workflow.add_edge("generator", "review")
    workflow.add_conditional_edges("review", critic_route, {"select_tools": "select_tools", "finalise": "finalise"})
    workflow.add_edge("finalise", END)
    workflow.add_edge("out_of_scope", END)
    return workflow.compile()
