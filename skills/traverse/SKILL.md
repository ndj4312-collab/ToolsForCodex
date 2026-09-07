---
name: traverse
description: Use when accepted architecture, spec, or tickets must be realized into a verified operational end state. Freeze the target and completion denominator, execute only the runnable frontier through existing implementation/TDD/review owners, diagnose failures to the earliest responsible stage, replay only affected downstream closure, and converge through regression and independent quality gates before endurance handoff.
compatibility: Requires accepted planning/spec/ticket state or routes incomplete planning to project-planning-compiler; composes existing implement, tdd, code-review, expected-output quality, Fable, and endure owners without replacing them.
---

# Traverse

Execute one verified realization transaction from accepted architecture/spec/tickets to operational end state.

Traverse owns **transaction sequencing, repair routing, and convergence**. It does not own target definition, architecture design, planning methodology, implementation methodology, TDD methodology, code-review methodology, evaluator semantics, or endurance semantics.

Read `references/traverse-context.md` for the frozen context-builder contract and ownership boundaries.

## 1. Freeze the transaction

Before mutation, freeze and record:

- target and accepted architecture/planning refs;
- current base revision and rollback point;
- accepted spec/ticket refs and blocker graph;
- ideal/constituent/surface/dependency obligation denominator;
- behavioral fixture denominator;
- Expected Output Quality denominator;
- authority, permission, migration, and rollback boundaries;
- relevant Agentic Intel evidence, contradictions, falsifiers, and evaluator needs.

Frozen denominators cannot shrink to make later results pass.

## 2. Ensure planning is actually settled

If target, topology, Goal/Intent/Context, spec, tickets, or blocker edges are materially unresolved, do not silently repair them inside Traverse.

Route to the earliest responsible owner:

- target defect -> `/idealize`;
- topology/owner/surface defect -> `/dispel`;
- Goal/Intent/Context or assumption defect -> `/grill-with-docs`;
- spec/ticket/dependency planning defect -> `project-planning-compiler`.

Resume Traverse only after the repaired upstream artifact is accepted. Replay only the downstream closure affected by that change.

## 3. Design verification before build

Bind every frozen obligation to objective evidence before implementation:

- choose the highest useful existing test seam;
- prefer fewer, stronger seams;
- cover positive, paraphrase/variant, negative, collision/route, dependency/integration, rollback/recovery, and regression behavior where applicable;
- preserve pre-agreed seams used by existing `/tdd` methodology;
- do not create tests against internals merely to increase coverage numbers.

## 4. Work only the executable frontier

Derive the current frontier from accepted ticket blocker edges.

A work item is runnable only when all of its blocking edges are satisfied. Never execute a blocked ticket merely to keep workers busy.

Parallelism follows dependency ownership. Independent frontier items may run concurrently; work sharing a mutable dependency must be ordered and refreshed after the first mutation validates.

## 5. Compose existing implementation owners

For each runnable work item:

1. invoke the existing `/implement` owner on settled work;
2. allow `/implement` to use existing `/tdd` at the pre-agreed seams;
3. run focused tests/type/static checks during implementation;
4. on implementation closure, run the full applicable suite once;
5. invoke existing `/code-review` against a pinned fixed point;
6. preserve implementation and review evidence in the traversal state.

Do not copy or reinterpret `/implement`, `/tdd`, or `/code-review` inside Traverse.

## 6. Verify affected closure

Run in increasing scope:

1. targeted checks for changed behavior;
2. dependency/integration checks for affected surfaces;
3. end-state checks against frozen obligations;
4. full regression after implementation closure;
5. Expected Output Quality evaluation;
6. Fable Judge when consequential/applicable.

Implementation or its worker may not self-certify the independent quality gate.

## 7. Diagnose to earliest responsible stage

For every failure, determine the earliest causal owner instead of patching the nearest symptom.

Repair routing:

- target -> `/idealize`;
- architecture/owner/surface -> `/dispel`;
- context/assumption -> `/grill-with-docs`;
- spec/ticket/dependency -> `project-planning-compiler`;
- implementation behavior -> `/implement`;
- evaluator defect -> evaluator lifecycle;
- recurrence -> `/endure` after accepted behavior exists.

Record the failure fingerprint, evidence, chosen owner, repair, and downstream closure that must be replayed.

## 8. Repair and replay only affected closure

After the earliest causal stage is repaired and accepted:

- invalidate downstream artifacts/evidence affected by the change;
- preserve unaffected accepted work;
- rebuild only the dependency closure that became stale;
- rerun required targeted/integration/end-state checks;
- rerun full regression and quality gates when terminal closure is reached.

Do not restart the entire pipeline without evidence that the entire pipeline is stale.

## 9. Converge against the frozen equation

Terminal Traverse success requires:

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

No averaging. No denominator shrinkage. No docs-only completion.

Use `scripts/validate_traversal_receipt.py` as a deterministic **receipt-structure and completion-equation gate**. It does not replace actual tests, review, quality evaluation, or runtime evidence.

## 10. Emit TraversalReceipt

The receipt must contain:

- frozen refs/digests, base revision, rollback point;
- accepted planning/spec/ticket refs;
- frozen denominator and test seams;
- executed frontier/waves and implementation deltas;
- targeted/integration/end-state/full-regression evidence refs;
- code-review and independent-quality verdicts;
- failures, earliest causal stages, repairs, and replayed closures;
- terminal completion metrics;
- unresolved items;
- endurance handoff, or explicit `NOT_APPLICABLE` rationale.

## 11. Endurance boundary

When accepted implementation reveals a recurring mandatory rule, route that behavior to `/endure` **after** Traverse acceptance. Traverse must not make endurance mutations itself.

If no recurrence is needed, record `NOT_APPLICABLE` with rationale.

## Hard failures

Stop on:

- duplicate implementation/TDD/review/evaluator ownership;
- blocked-ticket execution;
- denominator shrinkage;
- worker self-report treated as end-state proof;
- implementation self-certifying independent review/quality;
- downstream symptom patch when an upstream causal defect is known;
- unnecessary whole-pipeline restart instead of affected-closure replay;
- any required percentage below 100%;
- regressions, hard failures, or unresolved Sev1 above zero;
- automatic endurance mutation before accepted recurring behavior.

## End condition

Traverse is complete only when the frozen completion equation passes with objective evidence, independent review/quality gates are satisfied, rollback/recovery evidence is retained, and the traversal receipt identifies either a valid endurance handoff or a justified `NOT_APPLICABLE` recurrence result.
