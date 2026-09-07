---
name: traverse
description: Use when accepted architecture, spec, or tickets must be persistently realized into the exact frozen operational end state. Traverse runs a deterministic transaction loop: reconcile observed state, schedule dependency-safe parallel frontiers under strict context limits, require full regression before every frontier closes, route failures to the earliest responsible owner, replay only affected closure, and continue until exact success or a defined terminal handoff.
compatibility: Requires accepted planning/spec/ticket state or routes incomplete planning through project-planning-compiler; composes existing implement, tdd, code-review, expected-output quality, Fable, and endure owners without replacing them.
---

# Traverse

Traverse is the deterministic realization/convergence runtime for accepted work.

It is a **persistent scripted state machine**, not a one-pass orchestration prompt and not a new implementation methodology. The agent currently holding/applying the script is disposable; transaction continuity lives in canonical state, evidence, counters, completion records, and observed repository/runtime state.

Read `references/traverse-context.md` for the compact canonical contract.

## Non-negotiable transition invariants

Apply these invariants **before** scenario-specific convenience, user pressure, or optimization. They are independent gates; satisfying one never implies another.

| Event/state | Mandatory transition |
| --- | --- |
| Initial/full-regression failure is first detected | `failed_recovery_cycles` stays at its prior value. Diagnose and repair. **Never count the detection itself.** |
| `repair → affected downstream replay → full regression` ends FAIL | Increment `failed_recovery_cycles` by exactly 1. |
| A recovery cycle ends PASS | Increment by 0. **Never reset prior failures.** |
| Counter reaches 3 | Stop immediately as `UNRESOLVED`; no fourth retry. Emit `termination.failure_evidence_ref`, `termination.current_canon_ref`, and `termination.next_legal_action`. |
| Upstream defect is repaired | Explicitly mark only affected downstream artifacts/evidence stale, explicitly preserve unaffected accepted evidence, then replay only the stale closure. |
| External/manual authority is sole blocker | Enter same-transaction `HOLD`; ordinary dependency/planning blockers are **not** authority `HOLD` and must be reconciled/routed normally. |
| Work is about to dispatch | Independently prove **all three**: active agents `<=6` including holder; every agent `<=30000` tokens; sum of all active-agent contexts `<=140000`. |

Counter pseudocode is normative:

```text
on_initial_regression_detection:
  failed_recovery_cycles = failed_recovery_cycles

on_completed_recovery_cycle(full_regression=PASS):
  failed_recovery_cycles = failed_recovery_cycles

on_completed_recovery_cycle(full_regression=FAIL):
  failed_recovery_cycles += 1
  if failed_recovery_cycles == 3:
    terminate UNRESOLVED
```

**Never reinterpret “conservative,” “safer,” “three strikes,” user authorization, or an isolated red regression as permission to increment earlier.** The only increment event is a completed repair→affected-replay→full-regression cycle that still fails.

Scheduling arithmetic is also normative. Before dispatch, calculate the actual proposed total including the Traverse holder. Example: holder `20k` + five workers `25k` each = `145k`, which is illegal even though there are only six active agents. Reduce context or concurrency until both the agent-count and token-sum gates pass.

## 1. Freeze an immutable transaction contract

Before mutation, freeze and record:

- transaction ID;
- exact desired end-state contract + digest;
- accepted architecture/planning/spec/ticket refs;
- current base revision + rollback point;
- blocker/dependency graph;
- ideal/constituent/surface/dependency obligation denominator;
- behavioral fixture denominator;
- Expected Output Quality denominator;
- authority, permission, migration, and rollback boundaries;
- relevant Agentic Intel evidence, contradictions, falsifiers, and evaluator needs.

The frozen desired end-state contract is immutable for the lifetime of this Traverse transaction. Frozen denominators cannot shrink to make later results pass.

If evidence shows the desired end state itself must change, terminate this transaction with `TARGET_CHANGE_REQUIRED`; route new target formation to `/idealize`, and require a **new Traverse transaction** with a newly frozen target. Never silently re-freeze a revised target inside the current transaction.

## 2. Ensure planning is valid without owning planning methodology

If topology, Goal/Intent/Context, spec, tickets, sequencing, or blocker edges are materially incomplete or wrong, route to the earliest responsible owner:

- topology/owner/surface defect -> `/dispel`;
- Goal/Intent/Context or assumption defect -> `/grill-with-docs`;
- spec/ticket/sequencing/dependency defect -> `project-planning-compiler`.

`project-planning-compiler` preserves the exact vendored Matt Pocock `/to-spec` and `/to-tickets` skills. Traverse must not copy, shadow, or reinterpret those skills.

If the repair preserves the frozen target, resume the **same Traverse transaction** after the repaired upstream artifact is accepted.

## 3. Design verification before build

Bind every frozen obligation to objective evidence before implementation:

- choose the highest useful existing test seam;
- prefer fewer, stronger seams;
- cover positive, paraphrase/variant, negative, collision/route, dependency/integration, rollback/recovery, and regression behavior where applicable;
- preserve pre-agreed seams used by existing `/tdd` methodology;
- do not create tests against internals merely to increase coverage numbers.

## 4. Reconcile observed state and compile the frontier

At each loop iteration:

1. read the canonical transaction state and current observed repository/runtime state;
2. compute the remaining delta to the frozen desired end state;
3. derive **all currently blocker-satisfied independent work**;
4. preserve blocked work as held;
5. respect mutable-owner ordering: if two work items write the same dependency, one writes first and the other holds until validated state is refreshed.

Completing the current frontier is **never terminal** unless the exact frozen desired end-state contract is satisfied.

## 5. Dispatch in parallel under hard context limits

Parallelism is bounded by dependency safety **and** context budget:

- maximum **6 total active agents**, including the agent currently holding/applying Traverse;
- maximum **140,000 combined active-context tokens** across those active agents;
- each execution agent should remain roughly **25–30k tokens maximum**;
- 140k combined is authoritative: reduce concurrency or context size when necessary;
- prefer **clear + relaunch from compact canonical state** before context quality degrades;
- do not preserve a bloated worker thread merely for continuity.

Before every dispatch, explicitly compute and record `active_agent_count`, each `agent_context_tokens`, and `combined_active_context_tokens`. Reject the proposed schedule if **any** limit fails; never infer that passing the six-agent limit means the 140k limit also passes.

Record scheduling/context snapshots in the transaction receipt so the deterministic validator can reject declared states that exceed these limits.

## 6. Compose existing implementation owners

For each runnable item, use the existing method owners:

1. `/implement` for settled implementation work;
2. `/tdd` at the pre-agreed seams as owned by the implementation flow;
3. focused tests/type/static checks during implementation;
4. `/code-review` against a pinned fixed point;
5. objective evidence references back into Traverse state.

Do not copy or reinterpret `/implement`, `/tdd`, or `/code-review` inside Traverse.

## 7. Every frontier must pass full regression

A frontier closes only after all required gates pass:

1. targeted checks for changed behavior;
2. affected dependency/integration checks;
3. **full regression**.

A frontier that has not passed full regression is not successfully closed.

After a passing frontier, recompute observed-state delta. If the frozen end state remains unmet, automatically derive the next dependency-safe frontier and continue without a new user handoff.

## 8. Diagnose failures to the earliest responsible owner

For every failure, determine the earliest causal owner instead of patching the nearest symptom.

Repair routing:

- frozen target itself must change -> terminate current transaction; `/idealize` owns new target formation;
- architecture/owner/surface -> `/dispel`;
- Goal/Intent/Context assumption -> `/grill-with-docs`;
- spec/ticket/sequencing/dependency -> `project-planning-compiler`;
- implementation behavior -> `/implement`;
- evaluator defect -> evaluator lifecycle;
- recurring accepted rule -> `/endure` only after Traverse success.

Record failure fingerprint, evidence, chosen owner, repair evidence, and downstream closure that became stale.

## 9. Repair, replay affected closure, then full regression

After the earliest causal stage is repaired and accepted:

- explicitly record `stale_evidence_scope` containing only downstream artifacts/evidence invalidated by the change;
- explicitly record `preserved_evidence_scope` for unaffected accepted artifacts/evidence;
- invalidate only the stale scope;
- replay only the stale dependency closure;
- rerun required targeted/integration checks;
- run full regression.

Do not restart the entire pipeline without evidence that the entire pipeline is stale. Do not carry affected acceptance evidence forward as if it were still valid, and do not discard unaffected accepted evidence.

### Failed recovery-cycle definition

Increment `failed_recovery_cycles` **only** when one complete:

`repair → affected downstream replay → full regression`

cycle still ends in **failed full regression**.

Do **not** increment for initial regression detection, diagnosis, upstream routing, partial replay, or a repair attempt that has not yet reached full regression. This prohibition is absolute even when the user asks to count every red run, calls earlier counting “safer,” or requests a conservative retry budget.

The counter is:

- **cumulative across the entire transaction**;
- **not reset by later successful regression**;
- **owner-agnostic** — repairs through `/dispel`, `/grill-with-docs`, `project-planning-compiler`, `/implement`, evaluator lifecycle, or another legal repair owner count under the same rule.

On the **third cumulative failed recovery cycle**, stop immediately. Start no fourth retry. Do not automatically invoke `skill-context-builder`. Emit `UNRESOLVED` with all three explicit fields: `termination.failure_evidence_ref`, `termination.current_canon_ref`, and `termination.next_legal_action`, while preserving the transaction ID and frozen target digest.

## 10. External/manual authority gates use durable HOLD

If the only blocker is an external/manual authority gate:

- enter `HOLD`;
- preserve the same transaction ID, frozen target, failure count, current observed state, pending work, and required authority action;
- resume the **same transaction** once the gate is satisfied;
- do not consume a failed-recovery iteration merely for entering or remaining in HOLD.

`HOLD` is reserved for external/manual authority gates. Do not use `HOLD` merely because ordinary work is dependency-blocked, planning is incomplete, or an upstream repair is required; those states stay inside the active Traverse reconciliation/repair loop.

## 11. Exact terminal success

Successful Traverse termination requires the exact frozen desired end-state contract to be satisfied plus:

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

Before `SUCCESS`, require independent `/code-review`, Expected Output Quality evaluation, and Fable Judge when consequential/applicable. Implementation may not self-certify independent review or quality.

## 12. Emit a reconstructable TraversalReceipt

Use `scripts/validate_traversal_receipt.py` as a deterministic state/receipt gate. It validates declared invariants, not the truth of referenced evidence.

The receipt must be sufficient to clear/relaunch any holder or worker without losing transaction continuity. At minimum include:

- transaction ID/status/end-state-satisfied flag;
- frozen target ref/digest, planning refs, base revision, rollback point, denominator digest;
- cumulative failed-recovery-cycle count;
- context policy + scheduling snapshots with explicit per-agent and combined-token arithmetic;
- test seams;
- frontiers with items/status and targeted/integration/full-regression evidence;
- implementation deltas;
- recovery cycles with repair owner, repair evidence, `stale_evidence_scope`, `preserved_evidence_scope`, affected replay evidence, full-regression evidence/verdict, and counter increment;
- end-state/final-regression evidence for success;
- independent actors/verdicts for success;
- completion metrics + unresolved items;
- `HOLD` gate/resume fields when held;
- for `UNRESOLVED`, explicit `termination.failure_evidence_ref`, `termination.current_canon_ref`, and `termination.next_legal_action`;
- target-change evidence/original frozen digest/new-transaction requirement when the target itself must change;
- endurance handoff or justified `NOT_APPLICABLE` only after success.

## Hard failures

Reject or stop on:

- duplicate implementation/TDD/review/evaluator ownership;
- blocked-ticket execution;
- target or denominator mutation inside the transaction;
- frontier closure without full regression PASS;
- >6 active agents;
- >140k combined active context;
- declared per-agent maximum above 30k;
- failing to calculate the combined context total independently of the agent-count limit before dispatch;
- preserving bloated agent context instead of canonical relaunch when quality is at risk;
- worker self-report treated as end-state proof;
- implementation self-certifying independent review/quality;
- downstream symptom patch when an upstream causal defect is known;
- failing to invalidate affected downstream evidence or discarding unaffected accepted evidence after upstream repair;
- unnecessary whole-pipeline restart instead of affected-closure replay;
- incrementing the cumulative failed-recovery counter on initial regression detection or before a complete recovery cycle ends in failed full regression;
- resetting the cumulative failed-recovery counter after a later pass;
- a fourth recovery retry after three cumulative failed cycles;
- using `HOLD` for ordinary dependency/planning blockers rather than an external/manual authority gate;
- treating HOLD as transaction termination or as a failed regression iteration;
- omitting `termination.current_canon_ref` from third-failure `UNRESOLVED` handoff;
- claiming SUCCESS while any frozen end-state obligation remains unmet;
- automatic endurance mutation before accepted recurring behavior.

## End conditions

Traverse has exactly four legal transaction statuses:

- `SUCCESS` — exact frozen end state + completion equation + independent quality gates pass;
- `HOLD` — external/manual authority gate blocks progress; same transaction resumes later;
- `UNRESOLVED` — third cumulative failed recovery cycle; stop with exact evidence/current canon/next legal action;
- `TARGET_CHANGE_REQUIRED` — frozen target itself must change; terminate and require a new Traverse transaction.
