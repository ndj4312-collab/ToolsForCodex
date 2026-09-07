#!/usr/bin/env python3
"""Validate Traverse receipt structure and the frozen terminal completion equation.

This validates declared receipt state only. It does not execute tests, perform review,
or prove that referenced evidence is truthful.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


PERCENT_KEYS = (
    "ideal_obligation_coverage",
    "constituent_coverage",
    "surface_coverage",
    "dependency_coverage",
    "behavioral_fixture_score",
    "expected_output_quality",
)
ZERO_KEYS = ("regressions", "hard_failures", "unresolved_sev1")


class ReceiptError(Exception):
    pass


def _require_dict(obj: Any, label: str) -> dict[str, Any]:
    if not isinstance(obj, dict):
        raise ReceiptError(f"{label} must be an object")
    return obj


def _require_list(obj: Any, label: str) -> list[Any]:
    if not isinstance(obj, list):
        raise ReceiptError(f"{label} must be an array")
    return obj


def _require_nonempty(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ReceiptError(f"{label} must be a non-empty string")
    return value.strip()


def validate(receipt: dict[str, Any]) -> dict[str, Any]:
    frozen = _require_dict(receipt.get("frozen"), "frozen")
    for key in ("target_ref", "base_revision", "rollback_point", "denominator_digest"):
        _require_nonempty(frozen.get(key), f"frozen.{key}")
    planning_refs = _require_list(frozen.get("planning_refs"), "frozen.planning_refs")
    if not planning_refs:
        raise ReceiptError("frozen.planning_refs must contain at least one accepted planning/spec/ticket reference")

    test_seams = _require_list(receipt.get("test_seams"), "test_seams")
    if not test_seams:
        raise ReceiptError("test_seams must contain at least one pre-agreed verification seam")

    _require_list(receipt.get("executed_frontier"), "executed_frontier")
    _require_list(receipt.get("implementation_deltas"), "implementation_deltas")

    evidence = _require_dict(receipt.get("evidence"), "evidence")
    for key in ("targeted", "integration", "end_state", "full_regression"):
        refs = _require_list(evidence.get(key), f"evidence.{key}")
        if not refs:
            raise ReceiptError(f"evidence.{key} must contain at least one evidence reference")

    actors = _require_dict(receipt.get("actors"), "actors")
    implementation_actor = _require_nonempty(actors.get("implementation"), "actors.implementation")
    _require_nonempty(actors.get("code_review"), "actors.code_review")
    independent_actor = _require_nonempty(actors.get("independent_quality"), "actors.independent_quality")
    if independent_actor == implementation_actor:
        raise ReceiptError("independent quality evaluator cannot be the implementation actor")

    verdicts = _require_dict(receipt.get("verdicts"), "verdicts")
    if verdicts.get("code_review") != "PASS":
        raise ReceiptError("verdicts.code_review must be PASS")
    if verdicts.get("expected_output_quality") != "PASS":
        raise ReceiptError("verdicts.expected_output_quality must be PASS")
    fable = verdicts.get("fable")
    if fable not in ("PASS", "NOT_APPLICABLE"):
        raise ReceiptError("verdicts.fable must be PASS or NOT_APPLICABLE")
    if fable == "NOT_APPLICABLE":
        _require_nonempty(verdicts.get("fable_rationale"), "verdicts.fable_rationale")

    failures = _require_list(receipt.get("failures"), "failures")
    repairs = _require_list(receipt.get("repairs"), "repairs")
    for i, failure in enumerate(failures):
        item = _require_dict(failure, f"failures[{i}]")
        _require_nonempty(item.get("earliest_responsible_stage"), f"failures[{i}].earliest_responsible_stage")
        _require_nonempty(item.get("evidence_ref"), f"failures[{i}].evidence_ref")
    if failures and not repairs:
        raise ReceiptError("repairs must record repair/replay evidence when failures occurred")

    completion = _require_dict(receipt.get("completion"), "completion")
    for key in PERCENT_KEYS:
        if completion.get(key) != 100:
            raise ReceiptError(f"completion.{key} must equal 100")
    for key in ZERO_KEYS:
        if completion.get(key) != 0:
            raise ReceiptError(f"completion.{key} must equal 0")

    unresolved = _require_list(receipt.get("unresolved"), "unresolved")
    for i, item in enumerate(unresolved):
        if isinstance(item, dict) and str(item.get("severity", "")).upper() in {"SEV1", "1", "CRITICAL"}:
            raise ReceiptError(f"unresolved[{i}] contains a terminal severity-1 item")

    endurance = _require_dict(receipt.get("endurance_handoff"), "endurance_handoff")
    status = endurance.get("status")
    if status not in ("HANDOFF", "NOT_APPLICABLE"):
        raise ReceiptError("endurance_handoff.status must be HANDOFF or NOT_APPLICABLE")
    _require_nonempty(endurance.get("reason"), "endurance_handoff.reason")

    return {
        "valid": True,
        "completion_equation": "PASS",
        "frozen_denominator": frozen["denominator_digest"],
        "failure_count": len(failures),
        "unresolved_count": len(unresolved),
        "endurance_status": status,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("receipt", type=Path, help="TraversalReceipt JSON file")
    args = parser.parse_args()

    try:
        raw = json.loads(args.receipt.read_text(encoding="utf-8"))
        receipt = _require_dict(raw, "receipt")
        result = validate(receipt)
    except (OSError, json.JSONDecodeError, ReceiptError) as exc:
        print(json.dumps({"valid": False, "error": str(exc)}, indent=2, sort_keys=True))
        return 1

    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
