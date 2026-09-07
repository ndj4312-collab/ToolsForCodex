#!/usr/bin/env python3
"""Deterministic helpers for skill-context-builder context files."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

BEGIN = "<!-- CONTEXT_STATE_JSON_BEGIN -->"
END = "<!-- CONTEXT_STATE_JSON_END -->"
BLOCK_RE = re.compile(
    re.escape(BEGIN) + r"\s*```json\s*(\{.*?\})\s*```\s*" + re.escape(END),
    re.DOTALL,
)


def load_state(path: Path) -> tuple[str, dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    match = BLOCK_RE.search(text)
    if not match:
        raise SystemExit(f"machine-readable context-state block not found: {path}")
    try:
        state = json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"invalid context-state JSON in {path}: {exc}") from exc
    if not isinstance(state, dict):
        raise SystemExit("context-state JSON must be an object")
    return text, state


def write_state(path: Path, text: str, state: dict[str, Any]) -> None:
    rendered = json.dumps(state, indent=2, ensure_ascii=False)
    replacement = f"{BEGIN}\n```json\n{rendered}\n```\n{END}"
    updated, count = BLOCK_RE.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit("failed to replace context-state block")
    path.write_text(updated, encoding="utf-8")


def index_by_id(items: list[Any]) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for item in items:
        if isinstance(item, dict):
            item_id = item.get("id") or item.get("dependency_id")
            if isinstance(item_id, str):
                result[item_id] = item
    return result


def compile_kernel(state: dict[str, Any], spec: dict[str, Any]) -> dict[str, Any]:
    surfaces = index_by_id(state.get("surfaces", []))
    dependencies = index_by_id(state.get("dependencies", []))
    target_ids = list(spec.get("target_surfaces", []))
    dep_ids: set[str] = set()
    for key in ("reads", "writes", "waits_for", "releases", "blocked_by"):
        dep_ids.update(spec.get(key, []))

    missing_surfaces = [x for x in target_ids if x not in surfaces]
    missing_deps = sorted(x for x in dep_ids if x not in dependencies)
    if missing_surfaces or missing_deps:
        raise SystemExit(json.dumps({
            "missing_surfaces": missing_surfaces,
            "missing_dependencies": missing_deps
        }, indent=2))

    return {
        "worker_id": spec["worker_id"],
        "role": spec["role"],
        "stage": spec["stage"],
        "objective": spec["objective"],
        "target_surfaces": [surfaces[x] for x in target_ids],
        "reads": [dependencies[x] for x in spec.get("reads", [])],
        "writes": [dependencies[x] for x in spec.get("writes", [])],
        "waits_for": [dependencies[x] for x in spec.get("waits_for", [])],
        "releases": [dependencies[x] for x in spec.get("releases", [])],
        "blocked_by": [dependencies[x] for x in spec.get("blocked_by", [])],
        "downstream_consumers": spec.get("downstream_consumers", []),
        "current_state": state.get("current_state", {}),
        "required_end_state": spec.get("required_end_state", {}),
        "allowed_mutations": spec.get("allowed_mutations", []),
        "forbidden_mutations": spec.get("forbidden_mutations", []),
        "mechanism": spec.get("mechanism", ""),
        "evidence_required": spec.get("evidence_required", []),
    }


def flatten_expected(expected: dict[str, Any]) -> list[str]:
    checks: list[str] = []
    for key, value in expected.items():
        if isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    checks.append(str(item.get("id") or item.get("name") or json.dumps(item, sort_keys=True)))
                else:
                    checks.append(str(item))
        elif value not in (None, "", {}, []):
            checks.append(f"{key}:{value}")
    return checks


def score_state(state: dict[str, Any], observed: dict[str, Any]) -> dict[str, Any]:
    expected = flatten_expected(state.get("expected_state", {}))
    observed_ids = {str(x) for x in observed.get("satisfied", [])}
    if not expected:
        return {"score": 0.0, "grade": "NO_EXPECTED_STATE", "missing": []}
    satisfied = [x for x in expected if x in observed_ids]
    missing = [x for x in expected if x not in observed_ids]
    score = round(100.0 * len(satisfied) / len(expected), 2)
    grade = "A+" if score >= 90 else "ACCEPTABLE_ITERATION" if score >= 80 else "INCOMPLETE_ITERATION"
    return {"score": score, "grade": grade, "satisfied": satisfied, "missing": missing}


def compact_state(state: dict[str, Any], reconciliation: dict[str, Any]) -> dict[str, Any]:
    out = dict(state)
    for key in (
        "current_state", "active_targets", "surfaces", "dependencies",
        "routing", "decisions", "lessons", "workarounds", "expected_state",
        "stage_failures", "desired_state"
    ):
        if key in reconciliation:
            out[key] = reconciliation[key]
    out["iteration"] = int(reconciliation.get("iteration", int(out.get("iteration", 1)) + 1))
    for transient in (
        "worker_chatter", "completed_task_chatter", "obsolete_plans",
        "stale_intermediate_state", "superseded_worker_context", "redundant_findings"
    ):
        out.pop(transient, None)
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)

    p_kernel = sub.add_parser("kernel")
    p_kernel.add_argument("--context", required=True)
    p_kernel.add_argument("--worker-spec", required=True)
    p_kernel.add_argument("--output", required=True)

    p_score = sub.add_parser("score")
    p_score.add_argument("--context", required=True)
    p_score.add_argument("--observed", required=True)

    p_compact = sub.add_parser("compact")
    p_compact.add_argument("--context", required=True)
    p_compact.add_argument("--reconciliation", required=True)

    args = parser.parse_args()
    context = Path(args.context)
    text, state = load_state(context)

    if args.command == "kernel":
        spec = json.loads(Path(args.worker_spec).read_text(encoding="utf-8"))
        Path(args.output).write_text(json.dumps(compile_kernel(state, spec), indent=2) + "\n", encoding="utf-8")
    elif args.command == "score":
        observed = json.loads(Path(args.observed).read_text(encoding="utf-8"))
        print(json.dumps(score_state(state, observed), indent=2))
    elif args.command == "compact":
        reconciliation = json.loads(Path(args.reconciliation).read_text(encoding="utf-8"))
        write_state(context, text, compact_state(state, reconciliation))


if __name__ == "__main__":
    main()
