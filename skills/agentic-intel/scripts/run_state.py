#!/usr/bin/env python3
"""Deterministic run-state checks for the agentic-intel skill."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

COVERAGE_MODES = {"EXHAUSTIVE", "DECISION_SUFFICIENT", "TARGETED"}
SOURCE_MODES = {"notion", "notion+web"}
STAGES = [
    "CONTRACT",
    "DISCOVERY",
    "DECOMPOSITION",
    "ADJACENT_SEARCH",
    "EVIDENCE_GRAPH",
    "CURRENT_SURFACE_MAP",
    "BRAINSTORM",
    "REDTEAM",
    "CONVERGENCE",
    "PROPOSALS",
    "DEPENDENCY_CLOSURE",
    "REALIZATION",
    "VALIDATION",
    "HANDOFF",
]


def validate(state: dict) -> list[str]:
    errors: list[str] = []
    if state.get("source_mode") not in SOURCE_MODES:
        errors.append("source_mode must be notion or notion+web")
    mode = state.get("coverage_mode")
    if mode not in COVERAGE_MODES:
        errors.append("invalid coverage_mode")
    if mode == "EXHAUSTIVE":
        if state.get("denominator_known") is not True:
            errors.append("EXHAUSTIVE requires denominator_known=true")
        count = state.get("denominator_count")
        if not isinstance(count, int) or count < 0:
            errors.append("EXHAUSTIVE requires non-negative integer denominator_count")
    if state.get("stage") not in STAGES:
        errors.append("invalid stage")
    artifacts = [a for a in state.get("artifacts", []) if isinstance(a, dict)]
    ids = [a.get("id") for a in artifacts]
    if len(ids) != len(set(ids)):
        errors.append("artifact ids must be unique")
    return errors


def earliest_stale_stage(state: dict) -> str | None:
    stale = set(state.get("stale_stages", []))
    for stage in STAGES:
        if stage in stale:
            return stage
    return None


def resume_action(state: dict) -> dict:
    errors = validate(state)
    if errors:
        return {"ok": False, "action": "FAIL_CLOSED", "errors": errors}
    stale = earliest_stale_stage(state)
    if stale:
        return {"ok": True, "action": "REOPEN", "stage": stale}
    return {"ok": True, "action": "RESUME", "stage": state["stage"]}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["validate", "resume"])
    parser.add_argument("run_state")
    args = parser.parse_args()

    state = json.loads(Path(args.run_state).read_text(encoding="utf-8"))
    if args.command == "validate":
        errors = validate(state)
        print(json.dumps({"valid": not errors, "errors": errors}, indent=2))
        raise SystemExit(1 if errors else 0)

    print(json.dumps(resume_action(state), indent=2))


if __name__ == "__main__":
    main()
