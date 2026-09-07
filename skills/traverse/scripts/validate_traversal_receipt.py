#!/usr/bin/env python3
"""Validate Traverse transaction receipts and deterministic lifecycle invariants.

This validates declared receipt/state structure only. It does not execute tests,
perform review, measure model context directly, or prove referenced evidence is
truthful.
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
STATUSES = {"SUCCESS", "UNRESOLVED", "HOLD", "TARGET_CHANGE_REQUIRED"}
FRONTIER_STATUSES = {"CLOSED", "ACTIVE", "INVALIDATED"}
REGRESSION_VERDICTS = {"PASS", "FAIL"}


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


def _require_int(value: Any, label: str, minimum: int | None = None, maximum: int | None = None) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ReceiptError(f"{label} must be an integer")
    if minimum is not None and value < minimum:
        raise ReceiptError(f"{label} must be >= {minimum}")
    if maximum is not None and value > maximum:
        raise ReceiptError(f"{label} must be <= {maximum}")
    return value


def _validate_frozen(receipt: dict[str, Any]) -> dict[str, Any]:
    frozen = _require_dict(receipt.get("frozen"), "frozen")
    for key in (
        "target_ref",
        "target_digest",
        "base_revision",
        "rollback_point",
        "denominator_digest",
    ):
        _require_nonempty(frozen.get(key), f"frozen.{key}")
    planning_refs = _require_list(frozen.get("planning_refs"), "frozen.planning_refs")
    if not planning_refs:
        raise ReceiptError(
            "frozen.planning_refs must contain at least one accepted planning/spec/ticket reference"
        )
    for i, ref in enumerate(planning_refs):
        _require_nonempty(ref, f"frozen.planning_refs[{i}]")
    return frozen


def _validate_context_policy(receipt: dict[str, Any]) -> tuple[dict[str, Any], list[Any]]:
    policy = _require_dict(receipt.get("context_policy"), "context_policy")
    if policy.get("min_dispatch_agents") != 2:
        raise ReceiptError("context_policy.min_dispatch_agents must equal 2")
    if policy.get("max_active_agents") != 4:
        raise ReceiptError("context_policy.max_active_agents must equal 4")
    if policy.get("combined_active_context_ceiling") != 140000:
        raise ReceiptError(
            "context_policy.combined_active_context_ceiling must equal 140000"
        )
    per_agent_max = _require_int(
        policy.get("per_agent_context_max"),
        "context_policy.per_agent_context_max",
        minimum=1,
        maximum=30000,
    )
    if policy.get("prefer_clear_relaunch") is not True:
        raise ReceiptError("context_policy.prefer_clear_relaunch must be true")
    if policy.get("orchestration_mode") != "SCRIPTED_STATE_MACHINE":
        raise ReceiptError(
            "context_policy.orchestration_mode must be SCRIPTED_STATE_MACHINE"
        )

    snapshots = _require_list(receipt.get("context_snapshots"), "context_snapshots")
    for i, snapshot_raw in enumerate(snapshots):
        snapshot = _require_dict(snapshot_raw, f"context_snapshots[{i}]")
        agents = _require_list(snapshot.get("agents"), f"context_snapshots[{i}].agents")
        if len(agents) > 4:
            raise ReceiptError(f"context_snapshots[{i}] exceeds 4 active agents")
        total = 0
        seen: set[str] = set()
        for j, agent_raw in enumerate(agents):
            agent = _require_dict(agent_raw, f"context_snapshots[{i}].agents[{j}]")
            agent_id = _require_nonempty(
                agent.get("id"), f"context_snapshots[{i}].agents[{j}].id"
            )
            if agent_id in seen:
                raise ReceiptError(
                    f"context_snapshots[{i}] contains duplicate agent id {agent_id!r}"
                )
            seen.add(agent_id)
            tokens = _require_int(
                agent.get("tokens"),
                f"context_snapshots[{i}].agents[{j}].tokens",
                minimum=0,
                maximum=per_agent_max,
            )
            total += tokens
        if total > 140000:
            raise ReceiptError(
                f"context_snapshots[{i}] combined active context {total} exceeds 140000"
            )
    return policy, snapshots


def _validate_test_seams(receipt: dict[str, Any]) -> list[Any]:
    test_seams = _require_list(receipt.get("test_seams"), "test_seams")
    if not test_seams:
        raise ReceiptError("test_seams must contain at least one pre-agreed verification seam")
    return test_seams


def _validate_frontiers(receipt: dict[str, Any]) -> list[dict[str, Any]]:
    raw_frontiers = _require_list(receipt.get("frontiers"), "frontiers")
    frontiers: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for i, raw in enumerate(raw_frontiers):
        item = _require_dict(raw, f"frontiers[{i}]")
        frontier_id = _require_nonempty(item.get("id"), f"frontiers[{i}].id")
        if frontier_id in seen_ids:
            raise ReceiptError(f"frontiers contains duplicate id {frontier_id!r}")
        seen_ids.add(frontier_id)
        status = item.get("status")
        if status not in FRONTIER_STATUSES:
            raise ReceiptError(
                f"frontiers[{i}].status must be one of {sorted(FRONTIER_STATUSES)}"
            )
        _require_list(item.get("items"), f"frontiers[{i}].items")
        if status == "CLOSED":
            for key in ("targeted_evidence", "integration_evidence", "full_regression_evidence"):
                refs = _require_list(item.get(key), f"frontiers[{i}].{key}")
                if not refs:
                    raise ReceiptError(
                        f"frontiers[{i}].{key} must contain evidence for a CLOSED frontier"
                    )
            if item.get("full_regression_verdict") != "PASS":
                raise ReceiptError(
                    f"frontiers[{i}].full_regression_verdict must be PASS for a CLOSED frontier"
                )
        frontiers.append(item)
    return frontiers


def _validate_recovery_cycles(receipt: dict[str, Any], declared_failed: int) -> list[dict[str, Any]]:
    raw_cycles = _require_list(receipt.get("recovery_cycles"), "recovery_cycles")
    cycles: list[dict[str, Any]] = []
    fail_count = 0
    for i, raw in enumerate(raw_cycles):
        cycle = _require_dict(raw, f"recovery_cycles[{i}]")
        _require_nonempty(cycle.get("repair_owner"), f"recovery_cycles[{i}].repair_owner")
        _require_nonempty(cycle.get("repair_evidence_ref"), f"recovery_cycles[{i}].repair_evidence_ref")
        _require_nonempty(cycle.get("affected_replay_ref"), f"recovery_cycles[{i}].affected_replay_ref")
        _require_nonempty(
            cycle.get("full_regression_evidence_ref"),
            f"recovery_cycles[{i}].full_regression_evidence_ref",
        )
        verdict = cycle.get("full_regression_verdict")
        if verdict not in REGRESSION_VERDICTS:
            raise ReceiptError(
                f"recovery_cycles[{i}].full_regression_verdict must be PASS or FAIL"
            )
        incremented = cycle.get("incremented_failure_counter")
        if not isinstance(incremented, bool):
            raise ReceiptError(
                f"recovery_cycles[{i}].incremented_failure_counter must be boolean"
            )
        should_increment = verdict == "FAIL"
        if incremented != should_increment:
            raise ReceiptError(
                f"recovery_cycles[{i}] must increment the counter iff full regression FAILs"
            )
        if should_increment:
            fail_count += 1
        cycles.append(cycle)

    if fail_count != declared_failed:
        raise ReceiptError(
            "transaction.failed_recovery_cycles must equal the cumulative number of failed "
            "repair→affected-replay→full-regression cycles"
        )
    if fail_count > 3:
        raise ReceiptError("failed recovery cycles cannot exceed 3; Traverse must terminate at 3")
    return cycles


def _validate_success(
    receipt: dict[str, Any],
    transaction: dict[str, Any],
    frontiers: list[dict[str, Any]],
) -> None:
    if transaction.get("end_state_satisfied") is not True:
        raise ReceiptError("SUCCESS requires transaction.end_state_satisfied=true")
    failed = transaction["failed_recovery_cycles"]
    if failed >= 3:
        raise ReceiptError("SUCCESS is illegal after the third cumulative failed recovery cycle")
    if any(frontier.get("status") != "CLOSED" for frontier in frontiers):
        raise ReceiptError("SUCCESS requires every recorded frontier to be CLOSED")

    evidence = _require_dict(receipt.get("evidence"), "evidence")
    for key in ("end_state", "final_full_regression"):
        refs = _require_list(evidence.get(key), f"evidence.{key}")
        if not refs:
            raise ReceiptError(f"evidence.{key} must contain at least one evidence reference")

    actors = _require_dict(receipt.get("actors"), "actors")
    implementation_actor = _require_nonempty(
        actors.get("implementation"), "actors.implementation"
    )
    review_actor = _require_nonempty(actors.get("code_review"), "actors.code_review")
    independent_actor = _require_nonempty(
        actors.get("independent_quality"), "actors.independent_quality"
    )
    if review_actor == implementation_actor:
        raise ReceiptError("code review cannot be self-certified by the implementation actor")
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

    completion = _require_dict(receipt.get("completion"), "completion")
    for key in PERCENT_KEYS:
        if completion.get(key) != 100:
            raise ReceiptError(f"completion.{key} must equal 100")
    for key in ZERO_KEYS:
        if completion.get(key) != 0:
            raise ReceiptError(f"completion.{key} must equal 0")

    unresolved = _require_list(receipt.get("unresolved"), "unresolved")
    for i, item in enumerate(unresolved):
        if isinstance(item, dict) and str(item.get("severity", "")).upper() in {
            "SEV1",
            "1",
            "CRITICAL",
        }:
            raise ReceiptError(f"unresolved[{i}] contains a terminal severity-1 item")

    endurance = _require_dict(receipt.get("endurance_handoff"), "endurance_handoff")
    status = endurance.get("status")
    if status not in ("HANDOFF", "NOT_APPLICABLE"):
        raise ReceiptError("endurance_handoff.status must be HANDOFF or NOT_APPLICABLE")
    _require_nonempty(endurance.get("reason"), "endurance_handoff.reason")


def _validate_unresolved(receipt: dict[str, Any], transaction: dict[str, Any]) -> None:
    if transaction.get("end_state_satisfied") is not False:
        raise ReceiptError("UNRESOLVED requires transaction.end_state_satisfied=false")
    if transaction["failed_recovery_cycles"] != 3:
        raise ReceiptError("UNRESOLVED requires exactly 3 cumulative failed recovery cycles")
    termination = _require_dict(receipt.get("termination"), "termination")
    if termination.get("reason") != "THIRD_FAILED_RECOVERY_CYCLE":
        raise ReceiptError(
            "UNRESOLVED termination.reason must be THIRD_FAILED_RECOVERY_CYCLE"
        )
    for key in ("failure_evidence_ref", "current_canon_ref", "next_legal_action"):
        _require_nonempty(termination.get(key), f"termination.{key}")


def _validate_hold(receipt: dict[str, Any], transaction: dict[str, Any]) -> None:
    if transaction.get("end_state_satisfied") is not False:
        raise ReceiptError("HOLD requires transaction.end_state_satisfied=false")
    if transaction["failed_recovery_cycles"] >= 3:
        raise ReceiptError("HOLD is illegal after the third cumulative failed recovery cycle")
    hold = _require_dict(receipt.get("hold"), "hold")
    for key in ("gate_ref", "required_authority", "resume_condition", "current_state_ref"):
        _require_nonempty(hold.get(key), f"hold.{key}")
    if hold.get("same_transaction_resume") is not True:
        raise ReceiptError("hold.same_transaction_resume must be true")
    if hold.get("consumes_failure_iteration") is not False:
        raise ReceiptError("hold.consumes_failure_iteration must be false")


def _validate_target_change(receipt: dict[str, Any], transaction: dict[str, Any], frozen: dict[str, Any]) -> None:
    if transaction.get("end_state_satisfied") is not False:
        raise ReceiptError(
            "TARGET_CHANGE_REQUIRED requires transaction.end_state_satisfied=false"
        )
    if transaction["failed_recovery_cycles"] >= 3:
        raise ReceiptError(
            "TARGET_CHANGE_REQUIRED is not the legal terminal status after the third failed recovery cycle"
        )
    handoff = _require_dict(receipt.get("target_change_handoff"), "target_change_handoff")
    for key in ("evidence_ref", "current_canon_ref", "next_legal_action"):
        _require_nonempty(handoff.get(key), f"target_change_handoff.{key}")
    if handoff.get("frozen_target_digest") != frozen["target_digest"]:
        raise ReceiptError(
            "target_change_handoff.frozen_target_digest must preserve the transaction's original frozen target digest"
        )
    if handoff.get("requires_new_transaction") is not True:
        raise ReceiptError("target_change_handoff.requires_new_transaction must be true")


def validate(receipt: dict[str, Any]) -> dict[str, Any]:
    transaction = _require_dict(receipt.get("transaction"), "transaction")
    transaction_id = _require_nonempty(transaction.get("id"), "transaction.id")
    status = transaction.get("status")
    if status not in STATUSES:
        raise ReceiptError(f"transaction.status must be one of {sorted(STATUSES)}")
    failed_recovery_cycles = _require_int(
        transaction.get("failed_recovery_cycles"),
        "transaction.failed_recovery_cycles",
        minimum=0,
        maximum=3,
    )
    if not isinstance(transaction.get("end_state_satisfied"), bool):
        raise ReceiptError("transaction.end_state_satisfied must be boolean")

    frozen = _validate_frozen(receipt)
    _validate_context_policy(receipt)
    _validate_test_seams(receipt)
    frontiers = _validate_frontiers(receipt)
    _require_list(receipt.get("implementation_deltas"), "implementation_deltas")
    recovery_cycles = _validate_recovery_cycles(receipt, failed_recovery_cycles)

    if status == "SUCCESS":
        _validate_success(receipt, transaction, frontiers)
    elif status == "UNRESOLVED":
        _validate_unresolved(receipt, transaction)
    elif status == "HOLD":
        _validate_hold(receipt, transaction)
    elif status == "TARGET_CHANGE_REQUIRED":
        _validate_target_change(receipt, transaction, frozen)

    return {
        "valid": True,
        "transaction_id": transaction_id,
        "status": status,
        "frozen_target_digest": frozen["target_digest"],
        "failed_recovery_cycles": failed_recovery_cycles,
        "recovery_cycle_count": len(recovery_cycles),
        "frontier_count": len(frontiers),
        "completion_equation": "PASS" if status == "SUCCESS" else "NOT_TERMINAL_SUCCESS",
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
