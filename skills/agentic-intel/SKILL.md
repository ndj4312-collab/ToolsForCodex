---
name: agentic-intel
description: Use when the user invokes /agentic-intel, or when external intelligence such as papers, repositories, standards, benchmarks, articles, videos, podcasts, or AI news must be researched and applied to an agentic system. Convert evidence into traceable primitives, current-system deltas, converged proposals, and accepted realization work while preserving source authority, coverage denominators, narrower route ownership, quality gates, and resumable run state. Do not use for simple summaries, generic web/news lookup, non-agentic research, corpus assimilation already owned by ingest-and-endure, or pure idea-first idealize work.
compatibility: Requires source-native research interfaces for requested evidence planes; agentic system/context access for application work; idealize, dispel, grill-with-docs, to-spec, to-tickets, traverse, wiki-maintenance, and independent evaluation routes when those downstream stages are in scope.
---

# Agentic Intel

Turn external intelligence into evidence-governed agentic-system improvement.

Repository skill identity: `agentic-intel`.
Semantic owner: `agentic-research-to-application` / **Agentic Research-to-Application**.

Do not create new authority from research. External evidence informs decisions; current user instruction and applicable canon govern mutation.

Read `references/agentic-intel-context.md` when you need the complete lifecycle, provenance, run-state, quality, status, or failure contract.

## Trigger and negative scope

Use this skill when:

- the user explicitly invokes `/agentic-intel`;
- the user asks to find or inspect external intelligence and apply it to agents, models, skills, tools, routing, orchestration, context, memory, runtime, evaluation, automation, governance, provenance, security, or related agentic-system surfaces;
- comprehensive agentic-method horizon scanning is requested with concrete system implications or changes.

Do **not** trigger for:

- a simple summary or explanation with no agentic-system application target;
- generic current-news or web lookup;
- non-agentic research;
- deterministic corpus assimilation already fully owned by `/ingest-and-endure`;
- pure idea-to-perfect-state work already fully owned by `/idealize`;
- an exact narrower route that fully owns the task.

A narrower exact owner remains owner. Compose only the unique Agentic Intel obligations that are still required.

## 1. Resolve goal, authority, source plane, and coverage before deep research

Compile:

- `ResearchGoalContract`;
- `ResearchCoverageContract`;
- the applicable quality/expected-output contract;
- `AgenticIntelRunState`.

Declare exactly one evidence plane before research:

- `Agent-intel source mode > notion` for workspace/canon-only evidence;
- `Agent-intel source mode > notion+web` for workspace/canon plus fresh external evidence.

Explicit syntax:

- `/agentic-intel --sources notion <topic|source>`
- `/agentic-intel --sources notion+web <topic|source>`

If invoked semantically, external/current/paper/repository/news requests force `notion+web`; otherwise default to `notion` when the task is workspace/canon-only. Never silently switch planes. Record any later plane change in run state with provenance.

Freeze one coverage mode:

- `EXHAUSTIVE` — explicit denominator and per-item accounting required;
- `DECISION_SUFFICIENT` — research until every open decision has source-native evidence plus an alternatives/falsifier wave and the frontier yields zero decision-changing delta;
- `TARGETED` — named source/topic/branch only; never claim whole-domain completeness.

Coverage mode and denominator may change only through explicit recompilation with provenance.

Use `scripts/run_state.py` to initialize or validate durable run state when a filesystem runtime is available.

## 2. Discover with source-native evidence

Use the most source-native interface available for each modality. Prefer primary/official evidence for implementation semantics. Use secondary/community sources for discovery, critique, operational failure reports, and triangulation.

Never infer detailed contents from a title, abstract, metadata record, thumbnail, or inaccessible body. Record access limitations and narrow claims accordingly.

For every material source preserve a `SourceRecord` with identity/version/date, modality, authority class, access state, provenance, freshness, license/use constraints, extracted claims, and limitations.

## 3. Decompose recursively to implementation primitives

Traverse each material branch:

`source → claim → method → mechanism → capability → primitive → operation / representation / dependency / assumption → evaluator / enforcement / rejection`.

At each layer determine:

- what it is constituted from;
- how it is generated, selected, or manipulated;
- how it is tested;
- which oracle/evidence validates it;
- how it is enforced;
- when and why it should be rejected or removed.

Stop decomposing only when another lower layer would not change implementation or evaluation decisions.

## 4. Search adjacent mechanisms without research paralysis

For each material primitive search for decision-relevant:

- synonyms and alternate names;
- precursor and successor methods;
- alternative implementations;
- negative results and failure reports;
- simpler baselines;
- formal or production analogues;
- useful mechanisms from adjacent domains such as compiler design, control theory, SRE, testing, security, distributed systems, Bayesian decision, causal inference, knowledge management/HCI, safety engineering, and operations research.

Every branch must name the decision it could change. Perform at least one alternatives/negative-results/falsifier wave. Close the branch when the frontier produces zero new decision-changing mechanism, constraint, falsifier, dependency, surface, or candidate.

## 5. Maintain traceable evidence and explicit uncertainty

Maintain the consequential chain:

`SOURCE → FINDING → SYNTHESIS → REQUIREMENT → DECISION → IMPLEMENTATION → TEST`.

Preserve contradictions, inaccessible evidence, unresolved structural unknowns, and empirical unknowns. Do not convert inference into observed fact.

## 6. Map the current agentic system

Inspect applicable surfaces, including:

- goals/tasks;
- agents/models;
- capabilities/skills/tools;
- routers/orchestration/runtimes;
- context/memory/retrieval;
- prompts/schemas/config;
- registries/artifacts;
- evaluators/tests;
- permissions/security;
- provenance/observability;
- automation/transactions;
- wiki/docs/handoff;
- lifecycle;
- economics and human controls.

Classify each relevant current mechanism as:

`MISSING | PARTIAL | EXISTS_INERT | EXISTS_ROUTED | EXISTS_VERIFIED | DUPLICATE | CONFLICT | SUPERSEDED`.

## 7. Generate, attack, and converge candidates

For material architecture/system change:

1. use `/idealize` provisionally when a perfected candidate target improves exploration;
2. brainstorm with at least three genuinely distinct methods;
3. generate candidates by mechanism, not wording;
4. red-team with at least three materially different attack families;
5. cover scope/authority, dependency/routing, evaluator/validation, cost/paralysis, and drift/recovery when relevant;
6. convert each failure into root cause, patch, and regression fixture;
7. alternate fresh brainstorming and red-team portfolios until a fresh pair yields zero material delta in mechanism, failure class, dependency, surface, decision-changing evidence, or proposal set.

Do not freeze final topology before convergence if later evidence can still change it.

Implementation/test failures that expose a new primitive, dependency, or falsifier reopen the affected frontier.

## 8. Compile proposals and close dependencies

Classify candidates with:

`KEEP | USE | WRAP | SPECIALIZE | COMPOSE | MODIFY | EXTRACT_PATTERN | ADD | QUARANTINE | EXPERIMENT | REJECT | RETIRE`.

Rank by risk-adjusted lift and information value minus complexity, context, evaluation, and maintenance cost. Ranking never grants mutation authority.

Build task, capability, and evidence graphs separately. Enumerate affected surfaces, transitive dependencies, precedence, blast radius, rollback, and topological patch order.

## 9. Realize accepted changes through the existing owners

At the accepted realization boundary for material architecture:

`valid/fresh /idealize → /dispel → /grill-with-docs → /to-spec → spec red-team/repair → /to-tickets → /traverse`

Reuse a still-valid IdealContract; otherwise refresh it. `/traverse` owns implementation, tests, review, localized repair, and acceptance convergence. Do not create a second independent `/implement` owner. Documentation is not implementation proof.

When changing existing behavior, retain the incumbent until a frozen challenger passes appropriate normal, trap, null, baseline/ablation, cost, and regression tests under an independent evaluator.

Patch the smallest authoritative surfaces and recompute affected dependencies after mutation.

## 10. Quality, wiki, endurance, and status gates

Before substantive execution, freeze an expected-output quality contract with stable obligation IDs and an explicit denominator. Maintain a quality evidence matrix linking each mandatory obligation to output location, evidence, acceptance test, observed result, and status.

For consequential completion, require the applicable independent quality evaluator and Fable/judge gate. A `VERIFIED` claim requires every mandatory obligation to pass with no hard failure. Structural/process coverage alone is not substantive output-quality proof.

If Notion canon changes, use the current wiki transaction: semantic owner → smallest authoritative write → dependent pointer reconciliation → canon-wiki integrity audit.

Do not create a new endurance mutation automatically. Endure recurring behavior only when separately/currently required and only after exact implementation and acceptance.

Use status precisely:

- `RESEARCH_COMPLETE` — research contract fulfilled; realization not requested/authorized;
- `PROPOSAL_READY` — converged proposal and impact/authority state ready for decision;
- `PRE_ENDURANCE_READY` — accepted realization, tests, quality, and wiki gates pass; no new endurance mutation yet;
- `VERIFIED` — all currently required lifecycle gates, including endurance when separately required, pass;
- `BLOCKED` — a required unresolved obligation, evidence item, dependency, or gate prevents the claimed terminal state.

Never claim cross-runtime parity without direct equivalence evidence.

## Failure and resume behavior

- inaccessible source → record access state, seek alternate primary/metadata evidence, never hallucinate body;
- conflicting evidence → preserve conflict and seek discriminating evidence;
- route collision → preserve narrower/higher owner and compose only unique obligations;
- missing implementation capability → use the current workaround ladder; block only with evidence;
- endless research with no decision impact → close branch by the saturation rule;
- convergence not reached → do not promote final architecture;
- implementation/test failure → reopen the earliest causal stage;
- quality miss → reopen the earliest causal stage named by the evaluator;
- stale mutable dependency on resume → mark dependent artifacts stale/superseded and reopen the earliest affected stage;
- missing required wiki/endurance receipt → do not claim `VERIFIED`.

Replay only the affected downstream closure after a repair.

## Output contract

Return or persist, as applicable:

```yaml
agentic_intel_result:
  goal_contract:
  coverage_contract:
  run_state:
  sources:
  evidence_graph:
  primitive_graph:
  adjacent_methods:
  current_surface_map:
  idealized_target:
  brainstorm_cycles:
  redteam_cycles:
  convergence:
  proposals:
  dependency_graph:
  patches:
  validation:
  wiki_receipt:
  endurance_receipt:
  empirical_unknowns:
  status: RESEARCH_COMPLETE | PROPOSAL_READY | PRE_ENDURANCE_READY | VERIFIED | BLOCKED
```

## Completion

Do not complete on summary, worker self-report, or process coverage alone. Completion is the strongest status actually supported by the frozen goal/coverage/quality contracts, observed evidence, applicable independent judge, implementation/runtime proof, and required lifecycle receipts.
