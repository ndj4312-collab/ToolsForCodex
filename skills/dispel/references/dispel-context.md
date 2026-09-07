# Dispel Context

## Canonical owner

- Notion semantic owner: `Dispel`
- Stable ID: `dispel`
- Owner page ID: `3d174bf7-051b-8121-95bb-fe8cc0e8cd2f`
- Context-builder page ID: `3d474bf7-051b-8177-b44e-f8c429940732`
- Status at package compilation: `CANON` semantic owner; repository package is staged and remains `IMPLEMENTED_UNVERIFIED` until independent eval and registered runtime proof.

This repository package implements the existing semantic contract. It does not create a second semantic owner.

## Purpose

Turn a frozen ideal target into the smallest complete canonical ecosystem capable of realizing it. Produce constituent owners, surfaces, interfaces, dependencies, tests, migration phases, rollback, and a direct `/grill-with-docs -> /to-spec` handoff. Plan/compile only; do not implement.

## Routing

Positive route: frozen target + incomplete/foggy/shallow/duplicated ecosystem topology.

Negative routes:

- unclear or changing target -> `/idealize`;
- already-complete architecture/build plan -> `/to-spec` or `/traverse` as appropriate;
- research/evidence acquisition -> `/agentic-intel`;
- implementation/test/repair -> `/traverse`.

## Agentic Intel intake

The skill may consume `SourceRecord[]`, `EvidenceGraph`, `PrimitiveGraph`, `CurrentSurfaceGraph`, `CandidateProposal[]`, `ConvergenceRecord`, `SurfaceImpactGraph`, dependency evidence, conflicts, falsifiers, unknowns, and evaluators.

These are evidence, never authority. Preserve source -> finding -> constituent -> test provenance.

## Architecture deepening rules

Use the generalized vocabulary:

`module/owner -> interface -> depth -> seam -> adapter -> leverage -> locality`

Required rejection tests:

1. deletion test;
2. depth test;
3. ownership uniqueness;
4. locality/navigability;
5. evidence traceability;
6. interface-as-test-surface;
7. adapter seam evidence.

A shallow wrapper that contributes no independently necessary obligation, surface, invariant, or test seam is not a constituent.

## DispelContract shape

The deterministic validator expects JSON with this structure:

```json
{
  "schema_version": "1.0",
  "frozen_target": {"id": "target-id", "hash": "sha256-or-equivalent"},
  "obligations": [
    {"id": "O1", "description": "..."}
  ],
  "surfaces": [
    {"id": "S1", "kind": "runtime|canonical|governance|test|migration|other", "description": "..."}
  ],
  "constituents": [
    {
      "id": "C1",
      "semantic_key": "stable-capability-key",
      "semantic_owner": "canonical-owner",
      "obligations": ["O1"],
      "surfaces": ["S1"],
      "dependencies": [],
      "interfaces": ["I1"],
      "tests": ["T1"],
      "provenance": ["P1"]
    }
  ],
  "edges": [
    {"from": "C1", "to": "S1", "type": "owns"}
  ],
  "unresolved_decisions": [],
  "tests": [
    {
      "id": "T1",
      "covers_obligations": ["O1"],
      "covers_surfaces": ["S1"],
      "provenance": ["P1"]
    }
  ],
  "phases": [
    {"id": "PH1", "dependencies": [], "mutates": ["S1"], "rollback": "RB1"}
  ],
  "migration": [
    {"phase": "PH1", "dependencies": [], "acceptance_tests": ["T1"]}
  ],
  "rollback": [
    {"id": "RB1", "phase": "PH1", "mechanism": "..."}
  ],
  "provenance": [
    {"id": "P1", "source": "source-ref", "finding": "finding-ref"}
  ]
}
```

## Validator invariants

The deterministic validator fails closed when:

- `frozen_target.id` or `frozen_target.hash` is absent;
- required top-level collections are absent or empty where closure requires content;
- obligation, surface, constituent, test, phase, rollback, or provenance IDs are duplicated;
- any obligation lacks a constituent or test mapping;
- any surface lacks a constituent or test mapping;
- any constituent lacks exactly one string `semantic_owner`, a `semantic_key`, mapped obligation, mapped surface, mapped test, or provenance;
- the same `semantic_key` is assigned conflicting owners;
- a constituent dependency is unknown or lacks a matching `dependency` edge;
- graph edges point to unknown nodes;
- unresolved decisions are non-empty;
- a migration phase lacks rollback or objective acceptance tests;
- referenced tests, obligations, surfaces, phases, rollbacks, or provenance IDs are unknown.

## Current package surfaces

Expected first-class package:

- `skills/dispel/SKILL.md`
- `skills/dispel/references/dispel-context.md`
- `skills/dispel/scripts/validate_contract.py`
- `skills/dispel/agents/openai.yaml`
- `skills/dispel/evals/evals.json`
- `skills/distribution-manifest.json` registration
- `skills/INDEX.md` discovery entry
- `skills/production-orchestrator/SKILL.md` route

## Verification lifecycle

1. static read-back of every mutation;
2. deterministic validator positive and negative fixture tests;
3. independent with-skill eval against the adversarial eval set;
4. actual registered discovery/invocation proof;
5. only then consider promotion or `VERIFIED` claims.

Runtime parity across environments is not implied by repository presence.

## Context-builder reconciliation note

The original context placed repository mutation on hold while an Agentic Intel commit was in flight. The hold was intentionally released by isolating this work on `quarantine/dispel-skill-canon-2026-09-07`, based on observed Agentic Intel head `7978ed73f0c8df404629b236182ad9abfc3ec68f`. Shared-surface reconciliation with later Agentic Intel registration changes remains a merge/rebase obligation before promotion.
