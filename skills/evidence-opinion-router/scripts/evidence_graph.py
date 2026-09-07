#!/usr/bin/env python3
"""Deterministic evidence-confidence scoring for evidence-opinion-router.

Input: JSON object on stdin or --input path. The script does not search, fetch,
or interpret evidence. It only scores already-normalized evidence fields.
"""
from __future__ import annotations

import argparse
import json
import sys
from typing import Any, Dict, Tuple

SCHOLARLY_WEIGHTS = {
    "directness": 0.25,
    "quality": 0.20,
    "independence": 0.15,
    "precision": 0.10,
    "consistency": 0.15,
    "axis_coverage": 0.05,
    "falsifier_survival": 0.10,
}

LIVED_WEIGHTS = {
    "context_match": 0.25,
    "outcome_specificity": 0.20,
    "independent_recurrence": 0.20,
    "coherence": 0.10,
    "adequacy": 0.10,
    "failure_case_coverage": 0.10,
    "falsifier_survival": 0.05,
}

DECISION_WEIGHTS = {
    "root_claim_strength": 0.30,
    "cross_axis_convergence": 0.20,
    "source_independence": 0.15,
    "applicability": 0.15,
    "falsifier_survival": 0.20,
}


def bounded(value: Any) -> float:
    if not isinstance(value, (int, float)):
        raise ValueError(f"score must be numeric, got {value!r}")
    value = float(value)
    if value < 0.0 or value > 1.0:
        raise ValueError(f"score outside 0..1: {value}")
    return value


def weighted_known(record: Dict[str, Any], weights: Dict[str, float]) -> Tuple[float, int]:
    numerator = 0.0
    denominator = 0.0
    unknown = 0
    for key, weight in weights.items():
        value = record.get(key, "UNKNOWN")
        if value in (None, "UNKNOWN"):
            unknown += 1
            continue
        numerator += bounded(value) * weight
        denominator += weight
    if denominator == 0:
        return 0.0, unknown
    return numerator / denominator, unknown


def lane_score(record: Dict[str, Any], lane: str) -> float:
    if lane == "scholarly":
        score, unknown = weighted_known(record, SCHOLARLY_WEIGHTS)
        if unknown > 2:
            score = min(score, 0.85)
        return score
    if lane == "lived":
        score, _ = weighted_known(record, LIVED_WEIGHTS)
        if int(record.get("independent_source_count", 0)) <= 1:
            score = min(score, 0.55)
        return score
    raise ValueError(f"unknown lane {lane}")


def orientation(scholarly: float, lived: float) -> str:
    delta = scholarly - lived
    if delta >= 0.10:
        return "SCHOLARLY"
    if delta <= -0.10:
        return "LIVED_PRACTITIONER"
    return "MIXED"


def decision_score(data: Dict[str, Any]) -> Tuple[float, list[str]]:
    score, _ = weighted_known(data.get("decision_components", {}), DECISION_WEIGHTS)
    confidence = score * 100.0
    ceilings: list[tuple[float, str]] = []

    if data.get("scholarly_wave_active", False) and int(data.get("scholarly_source_count", 0)) < 10:
        ceilings.append((89.0, "active scholarly wave has fewer than 10 effective sources"))
    if int(data.get("meaningful_axis_count", 0)) < 3:
        ceilings.append((89.0, "fewer than 3 meaningful axes"))
    if not data.get("falsifier_search_complete", False):
        ceilings.append((84.0, "no completed falsifier/contradiction search"))
    if data.get("material_root_contradiction_unresolved", False):
        ceilings.append((89.0, "material root contradiction unresolved"))
    if data.get("lived_lane_material", False) and int(data.get("lived_independent_source_count", 0)) <= 1:
        ceilings.append((89.0, "lived lane is material but has <=1 independent source"))

    reasons: list[str] = []
    for ceiling, reason in ceilings:
        if confidence > ceiling:
            confidence = ceiling
        reasons.append(reason)
    return round(confidence, 2), reasons


def confidence_class(score: float) -> str:
    if score >= 95.0:
        return "AUTHORITATIVE"
    if score >= 90.0:
        return "RESEARCH_SUPPORTED"
    return "INSUFFICIENT"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", help="JSON input path; omit to read stdin")
    args = parser.parse_args()
    raw = open(args.input, "r", encoding="utf-8").read() if args.input else sys.stdin.read()
    data = json.loads(raw)

    scholarly = lane_score(data.get("scholarly_lane", {}), "scholarly")
    lived = lane_score(data.get("lived_lane", {}), "lived")
    confidence, ceiling_reasons = decision_score(data)

    result = {
        "scholarly_lane_score": round(scholarly * 100.0, 2),
        "lived_practitioner_lane_score": round(lived * 100.0, 2),
        "lane_orientation": orientation(scholarly, lived),
        "decision_confidence": confidence,
        "confidence_class": confidence_class(confidence),
        "ceiling_reasons": ceiling_reasons,
    }
    json.dump(result, sys.stdout, indent=2, sort_keys=True)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
