#!/usr/bin/env python3
"""Deterministically validate a DispelContract JSON document."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Iterable


class ValidationError(Exception):
    pass


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def _list(value: Any, name: str, *, nonempty: bool = False) -> list[Any]:
    _require(isinstance(value, list), f"{name} must be a list")
    if nonempty:
        _require(bool(value), f"{name} must not be empty")
    return value


def _string(value: Any, name: str) -> str:
    _require(isinstance(value, str) and value.strip() != "", f"{name} must be a non-empty string")
    return value


def _id_index(items: Iterable[dict[str, Any]], name: str) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for i, item in enumerate(items):
        _require(isinstance(item, dict), f"{name}[{i}] must be an object")
        item_id = _string(item.get("id"), f"{name}[{i}].id")
        _require(item_id not in result, f"duplicate {name} id: {item_id}")
        result[item_id] = item
    return result


def _validate_refs(values: Any, allowed: set[str], name: str, *, nonempty: bool = False) -> list[str]:
    refs = _list(values, name, nonempty=nonempty)
    for i, ref in enumerate(refs):
        ref = _string(ref, f"{name}[{i}]")
        _require(ref in allowed, f"{name}[{i}] references unknown id: {ref}")
    return refs


def validate(contract: dict[str, Any]) -> dict[str, Any]:
    _require(contract.get("schema_version") == "1.0", "schema_version must equal '1.0'")

    target = contract.get("frozen_target")
    _require(isinstance(target, dict), "frozen_target must be an object")
    _string(target.get("id"), "frozen_target.id")
    _string(target.get("hash"), "frozen_target.hash")

    obligations = _id_index(_list(contract.get("obligations"), "obligations", nonempty=True), "obligations")
    surfaces = _id_index(_list(contract.get("surfaces"), "surfaces", nonempty=True), "surfaces")
    constituents = _id_index(_list(contract.get("constituents"), "constituents", nonempty=True), "constituents")
    tests = _id_index(_list(contract.get("tests"), "tests", nonempty=True), "tests")
    phases = _id_index(_list(contract.get("phases"), "phases", nonempty=True), "phases")
    rollback = _id_index(_list(contract.get("rollback"), "rollback", nonempty=True), "rollback")
    provenance = _id_index(_list(contract.get("provenance"), "provenance", nonempty=True), "provenance")
    migration = _list(contract.get("migration"), "migration", nonempty=True)
    unresolved = _list(contract.get("unresolved_decisions"), "unresolved_decisions")
    _require(not unresolved, "unresolved_decisions must be empty before completion")

    obligation_ids = set(obligations)
    surface_ids = set(surfaces)
    constituent_ids = set(constituents)
    test_ids = set(tests)
    phase_ids = set(phases)
    rollback_ids = set(rollback)
    provenance_ids = set(provenance)

    semantic_owners_by_key: dict[str, str] = {}
    obligation_constituent_coverage: set[str] = set()
    surface_constituent_coverage: set[str] = set()

    for cid, constituent in constituents.items():
        semantic_key = _string(constituent.get("semantic_key"), f"constituents[{cid}].semantic_key")
        owner = _string(constituent.get("semantic_owner"), f"constituents[{cid}].semantic_owner")
        previous = semantic_owners_by_key.get(semantic_key)
        _require(previous is None or previous == owner, f"semantic_key {semantic_key} has conflicting owners: {previous} vs {owner}")
        semantic_owners_by_key[semantic_key] = owner

        c_obligations = _validate_refs(constituent.get("obligations"), obligation_ids, f"constituents[{cid}].obligations", nonempty=True)
        c_surfaces = _validate_refs(constituent.get("surfaces"), surface_ids, f"constituents[{cid}].surfaces", nonempty=True)
        _validate_refs(constituent.get("tests"), test_ids, f"constituents[{cid}].tests", nonempty=True)
        _validate_refs(constituent.get("provenance"), provenance_ids, f"constituents[{cid}].provenance", nonempty=True)
        deps = _validate_refs(constituent.get("dependencies", []), constituent_ids | surface_ids, f"constituents[{cid}].dependencies")
        _list(constituent.get("interfaces"), f"constituents[{cid}].interfaces", nonempty=True)

        obligation_constituent_coverage.update(c_obligations)
        surface_constituent_coverage.update(c_surfaces)
        constituent["__validated_dependencies"] = deps

    _require(obligation_constituent_coverage == obligation_ids, f"obligations missing constituent coverage: {sorted(obligation_ids - obligation_constituent_coverage)}")
    _require(surface_constituent_coverage == surface_ids, f"surfaces missing constituent coverage: {sorted(surface_ids - surface_constituent_coverage)}")

    test_obligation_coverage: set[str] = set()
    test_surface_coverage: set[str] = set()
    for tid, test in tests.items():
        test_obligation_coverage.update(_validate_refs(test.get("covers_obligations"), obligation_ids, f"tests[{tid}].covers_obligations", nonempty=True))
        test_surface_coverage.update(_validate_refs(test.get("covers_surfaces"), surface_ids, f"tests[{tid}].covers_surfaces", nonempty=True))
        _validate_refs(test.get("provenance"), provenance_ids, f"tests[{tid}].provenance", nonempty=True)

    _require(test_obligation_coverage == obligation_ids, f"obligations missing test coverage: {sorted(obligation_ids - test_obligation_coverage)}")
    _require(test_surface_coverage == surface_ids, f"surfaces missing test coverage: {sorted(surface_ids - test_surface_coverage)}")

    graph_nodes = constituent_ids | surface_ids
    edges = _list(contract.get("edges"), "edges", nonempty=True)
    dependency_pairs: set[tuple[str, str]] = set()
    for i, edge in enumerate(edges):
        _require(isinstance(edge, dict), f"edges[{i}] must be an object")
        source = _string(edge.get("from"), f"edges[{i}].from")
        dest = _string(edge.get("to"), f"edges[{i}].to")
        edge_type = _string(edge.get("type"), f"edges[{i}].type")
        _require(source in graph_nodes, f"edges[{i}].from references unknown node: {source}")
        _require(dest in graph_nodes, f"edges[{i}].to references unknown node: {dest}")
        if edge_type == "dependency":
            dependency_pairs.add((source, dest))

    for cid, constituent in constituents.items():
        for dep in constituent.pop("__validated_dependencies"):
            _require((cid, dep) in dependency_pairs, f"constituent dependency {cid} -> {dep} lacks a matching dependency edge")

    for pid, phase in phases.items():
        _validate_refs(phase.get("dependencies", []), phase_ids, f"phases[{pid}].dependencies")
        _validate_refs(phase.get("mutates"), surface_ids, f"phases[{pid}].mutates", nonempty=True)
        rb = _string(phase.get("rollback"), f"phases[{pid}].rollback")
        _require(rb in rollback_ids, f"phases[{pid}].rollback references unknown rollback: {rb}")

    rollback_by_phase: set[str] = set()
    for rid, rb in rollback.items():
        phase = _string(rb.get("phase"), f"rollback[{rid}].phase")
        _require(phase in phase_ids, f"rollback[{rid}].phase references unknown phase: {phase}")
        _string(rb.get("mechanism"), f"rollback[{rid}].mechanism")
        rollback_by_phase.add(phase)
    _require(rollback_by_phase == phase_ids, f"phases missing rollback entries: {sorted(phase_ids - rollback_by_phase)}")

    migrated_phases: set[str] = set()
    for i, step in enumerate(migration):
        _require(isinstance(step, dict), f"migration[{i}] must be an object")
        phase = _string(step.get("phase"), f"migration[{i}].phase")
        _require(phase in phase_ids, f"migration[{i}].phase references unknown phase: {phase}")
        _validate_refs(step.get("dependencies", []), phase_ids, f"migration[{i}].dependencies")
        _validate_refs(step.get("acceptance_tests"), test_ids, f"migration[{i}].acceptance_tests", nonempty=True)
        migrated_phases.add(phase)
    _require(migrated_phases == phase_ids, f"phases missing migration mapping: {sorted(phase_ids - migrated_phases)}")

    return {
        "valid": True,
        "schema_version": "1.0",
        "target": target["id"],
        "coverage": {
            "obligations": f"{len(obligation_ids)}/{len(obligation_ids)}",
            "surfaces": f"{len(surface_ids)}/{len(surface_ids)}",
            "constituents": len(constituent_ids),
            "tests": len(test_ids),
            "phases": len(phase_ids),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("contract", type=Path)
    args = parser.parse_args()

    try:
        payload = json.loads(args.contract.read_text(encoding="utf-8"))
        _require(isinstance(payload, dict), "contract root must be an object")
        result = validate(payload)
    except (OSError, json.JSONDecodeError, ValidationError) as exc:
        print(json.dumps({"valid": False, "error": str(exc)}, indent=2, sort_keys=True))
        return 1

    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
