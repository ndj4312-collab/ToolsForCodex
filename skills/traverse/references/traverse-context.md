# Traverse Context

## Canonical owner

- Notion semantic owner: `Traverse`
- Stable ID: `traverse`
- Owner page ID: `3d174bf7-051b-81d6-a838-f46aaea6cfd4`
- Context-builder page ID: `3d474bf7-051b-81c8-ad8f-cb0adf5442f0`

This package owns deterministic realization/convergence transaction state only.

## Desired state

Persistently realize accepted architecture/spec/tickets to the exact frozen desired end-state contract. Compose existing implementation/testing/review owners, schedule dependency-safe parallel work under explicit context limits, verify every frontier through full regression, route failures to the earliest responsible owner, preserve the same transaction across legal upstream repair and manual holds, and terminate only on exact success, target-change handoff, or the third cumulative failed recovery cycle.

## Ownership boundary

Traverse owns:

- deterministic transaction/state-machine logic and durable transaction state;
- frozen target/end-state contract, denominator digests, base revision, rollback point, and authority boundaries;
- verification/test-evidence plan;
- dependency-safe frontier compilation and bounded parallel dispatch;
- observed-state reconciliation and remaining-delta recompilation;
- earliest-cause failure diagnosis and repair routing;
- affected downstream replay closure;
- cumulative failed-recovery-cycle accounting;
- durable `HOLD` state for external/manual authority gates;
- terminal success, unresolved-state, and target-change handoffs;
- TraversalReceipt and `/endure` handoff after acceptance.

Traverse does not own:

- `/idealize` target definition;
- `/dispel` architecture/topology/semantic ownership;
- `/grill-with-docs` Goal/Intent/Context hardening;
- Matt `/to-spec` or `/to-tickets` methodology; incomplete planning routes through `project-planning-compiler`;
- `/implement` implementation methodology;
- `/tdd` testing methodology;
- `/code-review` review methodology;
- expected-output evaluator/Fable semantics;
- `/endure` recurrence enforcement.

## Immutable transaction contract

At `FREEZE`, record the desired end-state contract and digest, accepted architecture/planning refs, frozen acceptance + expected-output denominators, base revision, rollback point, and authority boundaries.

The desired end-state contract is immutable for the life of the Traverse transaction. Upstream repair may change architecture, planning, sequencing, dependencies, implementation, or evidence paths only while continuing to realize the same frozen end state. If the end-state contract itself must change, terminate the current Traverse transaction and hand off to a new transaction; do not silently re-freeze a new target.

## Persistent execution loop

1. `FREEZE` — freeze immutable end-state contract and transaction evidence roots.
2. `TEST_PLAN` — bind every frozen obligation to objective evidence at the highest useful existing seam.
3. `RECONCILE` — compare observed state with the frozen end state and compute remaining delta.
4. `FRONTIER` — derive all currently dependency-safe independent work; blocked work remains held.
5. `DISPATCH` — execute bounded parallel work through existing method owners.
6. `TARGETED_VERIFY` — run focused checks for changed behavior.
7. `INTEGRATION_VERIFY` — run affected dependency/integration checks.
8. `FULL_REGRESSION` — mandatory before any frontier closes.
9. `FRONTIER_CLOSE` — only after targeted + integration + full regression pass.
10. `RECOMPUTE_DELTA` — if frozen end state remains unmet, automatically derive the next frontier and continue.
11. `DIAGNOSE` — classify failures to the earliest responsible owner/stage.
12. `REPAIR_ROUTE` — invoke that owner; preserve unaffected accepted work.
13. `AFFECTED_REPLAY` — replay only downstream closure invalidated by the repair.
14. `RECOVERY_REGRESSION` — run full regression after repair/replay and update cumulative failed-cycle count only if this complete recovery cycle still fails.
15. `HOLD` — durable same-transaction wait for an external/manual authority gate.
16. `QUALITY_GATE` — at exact end-state satisfaction, require independent code-review/quality/Fable gates where applicable.
17. `SUCCESS_HANDOFF` — emit successful TraversalReceipt and route accepted recurring mandatory behavior to `/endure`.
18. `UNRESOLVED_HANDOFF` — on third cumulative failed recovery cycle, terminate with exact evidence/current canon/next legal action.
19. `TARGET_CHANGE_HANDOFF` — terminate if the frozen desired end state itself must change.

## Frontier semantics

- Completing a frontier is not terminal unless the exact frozen desired end-state contract is satisfied.
- After every successful frontier, recompute remaining delta from observed state and automatically continue to the next dependency-safe frontier.
- Every frontier must pass targeted verification, affected integration verification, and full regression before it closes.
- If no valid frontier can be derived because planning/spec/ticket/dependency state is incomplete or wrong, route to the earliest responsible upstream owner, obtain the repair, then resume the same Traverse transaction if the frozen target remains unchanged.

## Parallel execution and context budget

- Orchestration is deterministic scripting/state-machine logic held/applied by an agent; it does not require a long-lived intelligence-bearing orchestrator identity.
- Active dispatch is adaptive: **2–4 total active agents**, including the agent currently holding/applying Traverse. Choose the smallest sufficient count—2, 3, or 4—based on dependency-safe runnable work and context budget.
- Hard combined active-context ceiling: **140,000 tokens** across all active agents. This ceiling overrides maximum concurrency.
- Execution-agent context should remain roughly **25–30k tokens maximum per agent**; this is an upper bound, not a guaranteed allocation.
- Reduce concurrency or context size whenever necessary to remain below 140k combined.
- Prefer clearing and relaunching an agent from compact canonical transaction state before context quality degrades. Agent identity is disposable; transaction continuity lives in canonical state, worker completion records, evidence, counters, and observed repository/runtime state.
- Parallelize all independent blocker-satisfied work that fits dependency/ownership safety and the active-context budget.

## Regression failure accounting

A failed regression iteration means exactly one complete `repair → affected downstream replay → full regression` recovery cycle that still ends in failed full regression.

The counter does not increment for initial regression detection, diagnosis, an upstream routing decision, partial replay, or a repair attempt that has not yet reached full regression.

Rules:

- failed recovery cycles are cumulative across the entire transaction;
- a later successful regression does not reset the counter;
- the counter is owner-agnostic: repairs through `/dispel`, `/grill-with-docs`, `project-planning-compiler`, `/implement`, evaluator lifecycle, or another legal owner count under the same rule;
- on the third cumulative failed recovery cycle, Traverse stops immediately, starts no fourth retry, does not automatically invoke `skill-context-builder`, and emits an unresolved-state handoff with exact failure evidence, preserved current canon/state, and the next legal action.

## External/manual authority gates

If the only blocker is an external/manual authority gate:

- enter durable `HOLD`;
- preserve the same transaction ID, frozen contract, failure count, observed state, pending work, and required authority action;
- resume the same transaction when the gate is satisfied;
- HOLD does not consume a failed-recovery iteration.

## Repair router

- frozen target must change -> terminate current transaction; `/idealize` owns new target formation;
- topology/owner/surface defect -> `/dispel` -> resume same transaction if target unchanged;
- Goal/Intent/Context assumption defect -> `/grill-with-docs` -> resume same transaction if target unchanged;
- spec/ticket/sequencing/dependency defect -> `project-planning-compiler` -> resume same transaction;
- implementation behavior defect -> `/implement`;
- testing method -> `/tdd` as owned by implementation flow;
- code review -> `/code-review`;
- evaluator defect -> evaluator lifecycle;
- recurring accepted rule -> `/endure` after Traverse success.

Never silently repair an upstream semantic defect inside Traverse.

## Frozen completion equation

Successful termination requires the frozen desired end-state contract itself to be satisfied and all applicable canonical metrics to pass:

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

## TraversalReceipt minimum contract

```yaml
transaction:
  id: "..."
  status: SUCCESS | UNRESOLVED | HOLD | TARGET_CHANGE_REQUIRED
  failed_recovery_cycles: 0..3
  end_state_satisfied: true | false
frozen:
  target_ref: "..."
  target_digest: "..."
  planning_refs: ["..."]
  base_revision: "..."
  rollback_point: "..."
  denominator_digest: "..."
context_policy:
  min_dispatch_agents: 2
  max_active_agents: 4
  combined_active_context_ceiling: 140000
  per_agent_context_max: 30000
  prefer_clear_relaunch: true
  orchestration_mode: SCRIPTED_STATE_MACHINE
context_snapshots:
  - agents:
      - {id: "holder", tokens: 8000}
test_seams: ["..."]
frontiers:
  - id: "frontier-1"
    status: CLOSED | ACTIVE | INVALIDATED
    items: ["..."]
    targeted_evidence: ["..."]
    integration_evidence: ["..."]
    full_regression_evidence: ["..."]
    full_regression_verdict: PASS
implementation_deltas: ["..."]
recovery_cycles:
  - repair_owner: "implement"
    repair_evidence_ref: "..."
    affected_replay_ref: "..."
    full_regression_evidence_ref: "..."
    full_regression_verdict: PASS | FAIL
    incremented_failure_counter: true | false
```

For `SUCCESS`, additionally require final end-state/full-regression evidence, independent actors/verdicts, completion metrics, unresolved items, and endurance handoff/N/A.

For `UNRESOLVED`, require exactly three cumulative failed recovery cycles plus `termination.reason=THIRD_FAILED_RECOVERY_CYCLE`, exact failure evidence, current canon reference, and next legal action.

For `HOLD`, require gate reference, required authority, resume condition, current-state reference, `same_transaction_resume=true`, and `consumes_failure_iteration=false`.

For `TARGET_CHANGE_REQUIRED`, preserve the original frozen target digest, provide target-change evidence/current canon/next legal action, and require a new transaction.

The deterministic validator checks state/receipt invariants only. It does not prove that referenced evidence is truthful.

## Existing implementation owners at package base

Base commit: `adcb7f5e0b01cc0bd44e4a21b9ae171730b1e24a`.

- `.agents/skills/implement/SKILL.md` blob `7a0b11f5f4fe9505ea5c7983c3083ba1bf754f69`;
- `.agents/skills/tdd/SKILL.md` blob `ead7781d79eb11cdafa1ac2db978cadef0eba240`;
- `.agents/skills/code-review/SKILL.md` blob `2d276fe88bddd363395b4887a555769222a34975`.

These remain external method owners. Traverse invokes them; it does not copy or modify their bodies.

## Eval obligations

At minimum test:

1. persistent multi-frontier execution until the frozen end-state contract is satisfied;
2. frontier cannot close without targeted + integration + full regression PASS;
3. implementation reveals architecture defect -> route to `/dispel`, then resume same transaction if target unchanged;
4. planning graph invalid -> route to `project-planning-compiler`, then resume same transaction;
5. initial regression detection does not increment the failure counter;
6. only a completed failed repair→replay→full-regression cycle increments the counter;
7. later successful full regression does not reset prior failed-cycle count;
8. third cumulative failed recovery cycle terminates `UNRESOLVED` with exact evidence/current canon/next legal action and no fourth retry;
9. target change requires transaction termination/new transaction;
10. manual authority gate enters same-transaction `HOLD` and does not consume a failure iteration;
11. context scheduler uses an adaptive 2–4 total active-agent dispatch and rejects >4 active agents, >140k combined context, or per-agent max >30k; prefers clear/relaunch;
12. implementation self-certification is rejected;
13. denominator shrinkage is rejected;
14. accepted recurring rule routes to `/endure` only after Traverse success.

## Verification lifecycle

1. isolated quarantine branch;
2. exact package read-back and path delta;
3. deterministic validator positive and adversarial negative fixtures;
4. independent behavioral eval;
5. actual registered ToolsForCodex discovery/load/invocation;
6. promotion only after those pass;
7. cross-runtime parity only after separate proof.

## Hard failures

- duplicate implementation/TDD/review/evaluator owner;
- blocked-ticket execution;
- target or denominator mutation inside a transaction;
- frontier closure without full regression PASS;
- >4 active agents;
- >140k combined active context;
- per-agent context maximum above 30k;
- worker self-report used as final proof;
- implementation self-certification;
- downstream patch despite known upstream cause;
- unnecessary whole-pipeline restart;
- resetting cumulative failed-recovery count;
- fourth recovery retry after three failed cycles;
- treating HOLD as termination or failure iteration;
- incomplete terminal equation;
- automatic endurance mutation.
