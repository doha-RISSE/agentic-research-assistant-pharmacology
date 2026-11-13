"""Offline evaluator: calls the local API, then uses Groq only as an external judge."""
from __future__ import annotations

import json
import os
from pathlib import Path
from urllib.request import Request, urlopen

from openai import OpenAI

ROOT = Path(__file__).parent
API_URL = os.getenv("AGENT_API_URL", "http://localhost:8000/ask")


def ask(question: str) -> dict:
    request = Request(API_URL, data=json.dumps({"question": question}).encode(), headers={"Content-Type": "application/json"})
    with urlopen(request, timeout=180) as response:  # nosec B310: local evaluator endpoint configured by developer
        return json.loads(response.read())


def judge(client: OpenAI, case: dict, answer: dict, rubric: str) -> str:
    prompt = f"""{rubric}

Case: {json.dumps(case)}
Answer: {json.dumps(answer)}
Return compact JSON with 1-5 scores for each rubric, a trajectory score using the trace, and concise failure reasons."""
    response = client.chat.completions.create(
        model=os.environ.get("JUDGE_MODEL", "openai/gpt-oss-120b"),
        messages=[{"role": "user", "content": prompt}], temperature=0,
    )
    return response.choices[0].message.content or "{}"


def main() -> None:
    if not os.getenv("GROQ_API_KEY"):
        raise SystemExit("GROQ_API_KEY is required only to run evals/run.py; the API itself does not use it.")
    cases = json.loads((ROOT / "dataset.json").read_text(encoding="utf-8"))
    rubric = (ROOT / "rubric.md").read_text(encoding="utf-8")
    client = OpenAI(api_key=os.environ["GROQ_API_KEY"], base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"))
    report = []
    for case in cases:
        answer = ask(case["question"])
        report.append({"case": case["id"], "expected_sources": case["expected_sources"], "actual_sources": answer["sources"], "judge": judge(client, case, answer, rubric)})
    Path("reports").mkdir(exist_ok=True)
    Path("reports/evaluation.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("Wrote reports/evaluation.json")


if __name__ == "__main__":
    main()
