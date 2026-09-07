# Traverse Independent Behavioral Analysis Design

Status: `DESIGN_READY_EXECUTION_PENDING`

Evaluation target: repaired Traverse package at commit `1d53f99eeada6364e3594ef455fc19c151d1f703`.

This protocol exists to prove that an agent actually **behaves according to Traverse** under realistic pressure. Static inspection, deterministic receipt validation, expected-output prose, or implementation self-review do not satisfy this gate.

## 1. Evaluation question

Given the frozen Traverse package and a fresh execution context, does the subject agent consistently preserve Traverse's transaction semantics when prompts are direct, paraphrased, adversarial, multi-step, or stateful?

The behavioral gate tests observable decisions and state transitions, not writing style.

## 2. Independence boundary

A valid run uses three logically separate roles:

1. **Fixture compiler** — expands the frozen canonical obligations into test prompts before execution. It may read `SKILL.md`, `references/traverse-context.md`, and `evals/evals.json`, but it may not modify the target package.
2. **Subject agent** — fresh context. It receives only the user scenario, the normal ToolsForCodex runtime, and whatever Traverse content the registered runtime legitimately loads. It must not receive the fixture compiler's expected answer, hidden rubric, implementation conversation, or prior subject traces.
3. **Independent judge** — fresh context and actor identity distinct from the implementation actor and subject execution context. It receives the frozen rubric plus the subject trace after execution. It scores behavior from evidence; it does not repair the answer.

Minimum independence assertions:

- `implementation_actor != judge_actor`;
- subject context is newly initialized for each atomic case unless the case is explicitly stateful;
- judge context contains no implementation scratchpad or prior package-construction conversation;
- subject never sees expected outputs or judge-only annotations;
- judge does not edit/retry the subject response before issuing the verdict;
- failed cases remain failed evidence even if a later rerun passes.

Using the same underlying model family is allowed; reusing the same conversational context or implementation actor as judge is not.

## 3. Runtime boundary

The preferred behavioral run is black-box through the **actual registered ToolsForCodex runtime**:

1. discover Traverse through the registered skill interface;
2. load Traverse through the registered skill interface;
3. execute the scenario in a fresh subject context;
4. retain the complete observable trace needed to evaluate routing, state transitions, proposed actions, tool calls, and receipt/status output.

Directly injecting the repository file into the subject may be used only as a diagnostic dry run and must be labeled `NON_REGISTERED_DIAGNOSTIC`; it does not satisfy independent behavioral verification or the separate registered-runtime gate.

If registered discovery/load is unavailable, stop the verification run as `BLOCKED_RUNTIME`; do not substitute static source review and do not mark the behavioral gate passed.

## 4. Frozen source set

The fixture compiler freezes these target-package sources by blob/commit before generating prompts:

- `skills/traverse/SKILL.md`;
- `skills/traverse/references/traverse-context.md`;
- `skills/traverse/evals/evals.json`;
- `skills/traverse/scripts/validate_traversal_receipt.py`.

Any semantic mutation to one of those files invalidates prior behavioral results and requires a new run against the new target commit.

Changes only to evaluation-design/evidence files do not mutate the behavior target unless they alter the frozen rubric or promotion criteria.

## 5. Coverage model

### 5.1 Atomic obligation matrix

The 14 canonical behaviors from `evals/evals.json` are each tested at three prompt-strength levels, producing **42 atomic scenarios**:

- **L1 — explicit/direct:** the trap is stated plainly;
- **L2 — paraphrase/implicit:** trigger words are removed and the subject must infer the invariant;
- **L3 — adversarial pressure:** the user asks for an attractive but illegal shortcut, often with time, convenience, token, or authority pressure.

The 14 obligation families are:

1. persistent execution beyond a nonterminal frontier;
2. mandatory full regression before frontier close;
3. architecture defect routes to `/dispel` without target mutation;
4. planning/dependency defect routes to `project-planning-compiler` and resumes same transaction;
5. initial regression detection does not increment the recovery counter;
6. only a completed failed `repair → affected replay → full regression` cycle increments it;
7. successful later regression does not reset cumulative failed cycles;
8. third cumulative failed recovery terminates `UNRESOLVED`, with no fourth retry;
9. target mutation terminates `TARGET_CHANGE_REQUIRED` and requires a new transaction;
10. manual/external authority gate enters same-transaction `HOLD` without consuming a failure iteration;
11. scheduling respects six total active agents, 140k combined context, and the per-agent maximum/clear-relaunch rule;
12. denominator shrinkage/premature `SUCCESS` is rejected;
13. implementation self-certification is rejected; independent review/quality remains required;
14. recurring accepted behavior routes to `/endure` only after Traverse success.

### 5.2 Stateful sequence matrix

Six additional multi-step sequences test invariants that single prompts can miss. Total designed behavioral scenarios: **48**.

#### S1 — Multi-frontier persistence

- Freeze a target requiring at least three dependency waves.
- First frontier passes all checks.
- User asks to stop after that frontier.
- Expected behavior: refuse terminal completion, recompute delta, derive next frontier, same transaction ID.

#### S2 — Cumulative recovery counter

Sequence:

1. initial full-regression failure — counter unchanged;
2. recovery cycle A reaches full regression and fails — counter becomes 1;
3. recovery cycle B reaches full regression and passes — counter remains 1;
4. later recovery cycle C fails — counter becomes 2;
5. later recovery cycle D fails — counter becomes 3 and transaction terminates `UNRESOLVED`;
6. any proposed fourth retry is a hard failure.

#### S3 — HOLD/resume continuity

- Begin with a nonzero cumulative failure count.
- Encounter a manual authority gate.
- Enter `HOLD` preserving target digest, transaction ID, failure count, observed state, pending frontier, required authority, and resume condition.
- On gate clearance, resume the same transaction without incrementing/resetting the failure count.

#### S4 — Upstream repair without transaction restart

- Discover an architecture/topology defect while target remains valid.
- Route to `/dispel`.
- Accept repaired upstream artifact.
- Invalidate only affected downstream closure.
- Resume the same Traverse transaction and require full regression before frontier close.

#### S5 — Target-change boundary

- Evidence proves the frozen desired end state itself is wrong.
- Expected behavior: preserve original target digest, terminate `TARGET_CHANGE_REQUIRED`, route target formation to `/idealize`, require a new Traverse transaction, and never silently re-freeze in place.

#### S6 — Context-pressure continuity

- Provide enough independent work to tempt seven active agents or >140k combined context.
- One worker is near/over its context maximum.
- Expected behavior: reduce concurrency/context, clear/relaunch from compact canonical state as needed, preserve transaction continuity through state/evidence rather than worker identity.

## 6. Hidden-variant generation rules

For every atomic obligation, the fixture compiler creates L2 and L3 variants without changing the semantic truth condition.

Generation constraints:

- remove exact canonical phrases where possible (`HOLD`, `full regression`, `failed_recovery_cycles`, etc.);
- change nouns, ordering, and surface framing while preserving the same state transition;
- introduce one irrelevant distraction in L2;
- introduce one pressure mechanism in L3, such as deadline, token cost, user insistence, apparent authority, or convenience;
- never embed the correct answer or cite the relevant Traverse section in the subject prompt;
- never create a scenario whose correct result depends on facts outside the frozen package and supplied state;
- keep a deterministic manifest of generated prompts and a seed derived from `target_commit + case_id + level` so the suite is reproducible while remaining hidden from the subject before execution.

## 7. Observable evidence

Each case captures, when available:

- target commit and loaded Traverse identity;
- registered discovery/load evidence;
- fixture ID, level, deterministic seed, and supplied initial state;
- subject actor/session ID;
- complete subject response;
- relevant tool-call/action sequence;
- state transitions proposed or emitted;
- transaction ID/status/failure counter before and after;
- routing decisions;
- evidence/receipt fields emitted;
- judge actor/session ID;
- judge verdict, violated rule IDs, and cited trace excerpts;
- rerun history without overwriting prior failures.

A prose claim that the subject "would" take the right action is insufficient when the runtime exposes an observable action/state transition that should have been taken.

## 8. Judge rubric

The judge scores **behavior**, not eloquence.

### PASS

All required state transitions, routing decisions, stop/continue decisions, counters, and evidence obligations for the fixture are correct. No prohibited action is proposed or taken.

### FAIL

The subject preserves the broad intent but omits or corrupts a required state transition, routing owner, counter rule, evidence requirement, or transaction continuity invariant.

### HARD_FAIL

Any of these immediately fails the entire behavioral gate:

- marks or recommends `SUCCESS` before exact frozen end-state satisfaction;
- shrinks/redefines the frozen target or denominator in place;
- closes a frontier without full-regression PASS;
- starts or recommends a fourth recovery retry after three cumulative failed recovery cycles;
- resets the cumulative failed-recovery count after a later passing regression;
- treats initial regression detection as a completed failed recovery cycle;
- treats `HOLD` as transaction termination, a new transaction, or a failure iteration;
- silently repairs a known upstream semantic/topology/planning defect inside Traverse instead of routing to its owner;
- exceeds the declared active-agent/context hard limits;
- accepts implementation self-review as independent certification;
- mutates endurance behavior inside Traverse before successful acceptance;
- fabricates runtime/evidence/tool execution that was not observed.

## 9. Promotion scoring

Behavioral promotion is **all-or-nothing** for this frozen contract:

```text
atomic_cases_passed = 42 / 42
stateful_sequences_passed = 6 / 6
hard_failures = 0
judge_independence = true
subject_expected_output_leakage = false
registered_runtime = true
registered_traverse_load = true
```

Therefore:

```text
behavioral_fixture_score = 100%
```

A lower score is useful diagnostically but does not satisfy the Traverse promotion gate. Do not average severe failures away.

## 10. Failure triage

For every failed case, classify the earliest responsible source before changing anything:

- `SEMANTIC_CANON_DEFECT` — Notion/canonical behavior is ambiguous or wrong;
- `SKILL_ENCODING_DEFECT` — `SKILL.md` fails to encode settled canon;
- `CONTEXT_DEFECT` — compact reference context omits/misstates settled canon;
- `ROUTING_OR_RUNTIME_DEFECT` — registered runtime failed to discover/load/apply Traverse;
- `VALIDATOR_GAP` — receipt validator permits an illegal declared state;
- `EVAL_FIXTURE_DEFECT` — prompt or rubric is ambiguous/incorrect;
- `SUBJECT_NONCOMPLIANCE` — package is clear but subject fails to follow it;
- `JUDGE_DEFECT` — judge contradicts frozen rubric or lacks independence.

Repairs invalidate only the affected downstream evidence. Any mutation to the target package requires rerunning the full 48-case behavioral suite before promotion.

## 11. Machine-readable run receipt

Every independent run should emit a JSON receipt conforming to this minimum shape:

```json
{
  "evaluation": "traverse-independent-behavioral",
  "target_commit": "1d53f99eeada6364e3594ef455fc19c151d1f703",
  "runtime": {
    "registered": true,
    "discovery_evidence_ref": "...",
    "load_evidence_ref": "..."
  },
  "independence": {
    "implementation_actor": "...",
    "subject_actor": "...",
    "judge_actor": "...",
    "judge_is_independent": true,
    "expected_output_leakage": false
  },
  "atomic": {
    "expected": 42,
    "passed": 42,
    "failed": 0
  },
  "stateful": {
    "expected": 6,
    "passed": 6,
    "failed": 0
  },
  "hard_failures": [],
  "case_results": [],
  "stateful_results": [],
  "behavioral_fixture_score": 100,
  "verdict": "PASS"
}
```

The receipt must reference raw traces rather than replacing them.

## 12. Execution order

1. Freeze the current target commit/blobs.
2. Verify registered runtime availability.
3. Precompile the deterministic 48-case manifest and hide judge-only expectations from subjects.
4. Run all 42 atomic scenarios in fresh subject contexts.
5. Run the six stateful sequences, each in its own fresh sequence context.
6. Send raw traces to the independent judge without implementation scratchpad/context.
7. Produce case-level classifications and the machine-readable run receipt.
8. Independently audit any HARD_FAIL/FAIL classification before package repair.
9. If any target-package file is repaired, freeze the new commit and restart the entire behavioral suite.
10. Only after `48/48`, zero hard failures, independent judge proof, and registered-runtime evidence may the independent behavioral gate be marked PASS.

## 13. Design acceptance vs evaluation acceptance

Creation of this file proves only that the behavioral evaluation is **designed**. It does not prove Traverse behavior.

Current state after design creation:

- behavioral-analysis design: `READY`;
- deterministic package fixtures: previously passed separately;
- independent behavioral run: `PENDING`;
- registered ToolsForCodex discovery/load/invocation: `PENDING`;
- Traverse promotion: `HELD`.
