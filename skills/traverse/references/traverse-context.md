# Traverse Context

## Canonical owner

- Notion semantic owner: `Traverse`
- Stable ID: `traverse`
- Owner page ID: `3d174bf7-051b-81d6-a838-f46aaea6cfd4`
- Context-builder page ID: `3d474bf7-051b-81c8-ad8f-cb0adf5442f0`

This package owns the realization/convergence transaction only.

## User intent

Continue the `skill-context-builder` packaging loop with the next dependency-safe canonical skill after `project-planning-compiler`.

## Ownership boundary

Traverse owns:

- freezing transaction refs and denominators;
- test/evidence planning for the realization transaction;
- executable-frontier orchestration;
- failure diagnosis to earliest responsible stage;
- localized repair and downstream closure replay;
- terminal convergence and traversal receipt;
- endurance handoff after accepted recurring behavior.

Traverse does not own:

- `/idealize` target definition;
- `/dispel` topology/ownership;
- `/grill-with-docs` Goal/Intent/Context hardening;
- `project-planning-compiler` planning/spec/ticket composition;
- `/implement` implementation methodology;
- `/tdd` testing methodology;
- `/code-review` review methodology;
- expected-output evaluator/Fable semantics;
- `/endure` recurrence enforcement.

## Existing implementation owners at package base

Base commit: `adcb7f5e0b01cc0bd44e4a21b9ae171730b1e24a`.

- `.agents/skills/implement/SKILL.md` blob `7a0b11f5f4fe9505ea5c7983c3083ba1bf754f69`;
- `.agents/skills/tdd/SKILL.md` blob `ead7781d79eb11cdafa1ac2db978cadef0eba240`;
- `.agents/skills/code-review/SKILL.md` blob `2d276fe88bddd363395b4887a555769222a34975`.

These remain external method owners. Traverse invokes them; it does not copy their bodies.

## Preferred input

- frozen Ideal/Dispel/GRILL refs as applicable;
- accepted planning/spec/ticket refs from `project-planning-compiler`;
- blocker-derived executable frontier;
- frozen acceptance and expected-output denominators;
- authority/permission boundaries;
- Agentic Intel evidence/provenance when present;
- rollback/recovery constraints.

If planning state is incomplete, return to `project-planning-compiler` instead of rebuilding Matt `/to-spec` or `/to-tickets` inside Traverse.

## Transaction state machine

1. `FREEZE`
2. `TEST_PLAN`
3. `FRONTIER`
4. `IMPLEMENT`
5. `TARGETED_VERIFY`
6. `INTEGRATION_VERIFY`
7. `DIAGNOSE`
8. `REPAIR_REPLAY`
9. `FULL_REGRESSION`
10. `QUALITY_GATE`
11. `CONVERGE`
12. `HANDOFF`

## Repair router

- target defect -> `/idealize`;
- topology/owner/surface defect -> `/dispel`;
- Goal/Intent/Context defect -> `/grill-with-docs`;
- spec/ticket/dependency defect -> `project-planning-compiler`;
- implementation behavior defect -> `/implement`;
- evaluator defect -> evaluator lifecycle;
- recurrence -> `/endure` after acceptance.

Never silently repair an upstream semantic defect inside Traverse.

## Frozen completion equation

```text
ideal_obligation_coverage=100%
AND constituent_coverage=100%
AND surface_coverage=100%
AND dependency_coverage=100%
AND behavioral_fixture_score=100%
AND expected_output_quality=100%
AND regressions=0
AND hard_failures=0
AND unresolved_sev1=0
```

No averaging. Frozen denominators cannot shrink.

## TraversalReceipt

```yaml
traversal_receipt:
  frozen:
    target_ref: "..."
    planning_refs: []
    base_revision: "..."
    rollback_point: "..."
    denominator_digest: "..."
  test_seams: []
  executed_frontier: []
  implementation_deltas: []
  evidence:
    targeted: []
    integration: []
    end_state: []
    full_regression: []
  actors:
    implementation: "..."
    code_review: "..."
    independent_quality: "..."
  verdicts:
    code_review: PASS
    expected_output_quality: PASS
    fable: PASS | NOT_APPLICABLE
    fable_rationale: "..."
  failures: []
  repairs: []
  completion:
    ideal_obligation_coverage: 100
    constituent_coverage: 100
    surface_coverage: 100
    dependency_coverage: 100
    behavioral_fixture_score: 100
    expected_output_quality: 100
    regressions: 0
    hard_failures: 0
    unresolved_sev1: 0
  unresolved: []
  endurance_handoff:
    status: HANDOFF | NOT_APPLICABLE
    reason: "..."
```

The deterministic validator checks receipt structure and the declared terminal equation. It does **not** create or validate the underlying test/review evidence itself.

## Eval obligations

At minimum test:

1. accepted plan + runnable frontier -> implement/verify/review/converge;
2. implementation reveals architecture defect -> route to `/dispel`, then replay affected closure only;
3. every ticket blocked -> no implementation until planning graph repaired;
4. user asks to lower denominator after failures -> refuse shrinkage;
5. implementation claims its own tests are enough -> require independent review/quality;
6. accepted recurring rule discovered -> route to `/endure`, do not mutate endurance inside Traverse.

## Verification lifecycle

1. isolated branch from current planning-compiler head;
2. static package read-back;
3. receipt-validator positive fixture;
4. denominator-shrink / regression / missing-independent-gate negative fixtures;
5. independent behavioral eval;
6. actual registered discovery/invocation;
7. promotion only after runtime proof.

## Hard failures

- duplicate implementation/TDD/review/evaluator owner;
- blocked-ticket execution;
- denominator shrinkage;
- worker self-report used as final proof;
- implementation self-certification;
- downstream patch despite known upstream cause;
- unnecessary whole-pipeline restart;
- incomplete terminal equation;
- automatic endurance mutation.
