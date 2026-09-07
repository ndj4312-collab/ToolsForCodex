# Project Planning Compiler Context

## Canonical owner

- Notion semantic owner: `Project Planning Compiler`
- Stable ID: `project-planning-compiler`
- Owner page ID: `3d474bf7-051b-8148-ae1f-ef9f8caf0d60`
- Context-builder page ID: `3d474bf7-051b-81d2-96fc-c7b1f591ed2b`

This package owns the local planning wrapper only.

## User-owned correction

`/to-spec` is the exact Matt Pocock skill. `/to-tickets` is paired with it unchanged inside the local planning protocol. Local code must not create a second semantic owner, modified template, alternate interaction model, or specialized fork of either skill.

## Immutable upstream dependencies

### to-spec

- source: `mattpocock/skills`
- runtime path: `.agents/skills/to-spec/SKILL.md`
- lockfile path metadata: `skills/engineering/to-spec/SKILL.md`
- observed Git blob: `3fd64959895b7eb095a13d797e1c7544f1f08c8f`
- lockfile computedHash: `144cf30cf527faff7f9211ae81ad3de5aaa6390f639b87ca5a48f5e818a8d33e`

### to-tickets

- source: `mattpocock/skills`
- runtime path: `.agents/skills/to-tickets/SKILL.md`
- lockfile path metadata: `skills/engineering/to-tickets/SKILL.md`
- observed Git blob: `96deac51d4391a3f691478d48f85f43261516c08`
- lockfile computedHash: `e817ecc8ffbb51dd5edd7cc141fe209f31c298dfd66b886e0c6c9aba2dd70266`

Git blob SHA and lockfile `computedHash` are separate provenance signals and are not assumed to use the same algorithm.

## Planning sources

Local planning semantics consolidate:

- `08 — Goal-to-Task Planning Runtime`: adaptive depth, dependency-aware executable work, no plan-only drift;
- `BMAD Adaptive Depth Router`: D0/D1/D2/D3 planning burden;
- Matt `ask-matt`: multi-session flow uses `/to-spec -> /to-tickets`, preserving one useful context window through the pair.

## Boundary of ownership

The wrapper may:

- choose planning depth;
- invoke upstream prerequisite owners when their state is actually unresolved;
- verify the exact Matt dependency identity/provenance;
- invoke `/to-spec` then `/to-tickets`;
- maintain context continuity;
- compile an external planning receipt from their actual artifacts;
- derive the dependency DAG/frontier from ticket blocker edges;
- attach local execution metadata required by stronger governing canon;
- route executable work onward.

The wrapper may not:

- edit Matt skill files;
- override their interviews, templates, tracker semantics, slicing rules, or publication behavior;
- replace Matt outputs with a local spec/ticket schema;
- claim planning artifacts are implementation;
- shrink obligations to fit produced tickets.

## Planning depth

- D0: direct, reversible, narrow.
- D1: brief outcome/constraint/acceptance artifact.
- D2: hardened context + exact Matt spec/tickets + implementation/verification.
- D3: D2 plus architecture/product/UX/security/eval lenses and independent challenge.

Preserve any stronger exact route. Evidence may escalate depth. Token/time pressure alone cannot reduce it.

## Spec-capable preparation

Use only when needed:

- target defect -> `/idealize`;
- topology/owner/surface/dependency defect -> `/dispel`;
- Goal/Intent/Context ambiguity or user-decision defect -> `/grill-with-docs`;
- evidence gap -> relevant research owner.

Do not rerun settled stages without evidence of change.

## PlanningReceipt

The wrapper receipt should reference, not replace, primary planning artifacts:

```yaml
planning_receipt:
  goal_refs: []
  authority_refs: []
  selected_depth: D0 | D1 | D2 | D3
  rationale: []
  prerequisite_refs: []
  matt_dependency_verification:
    status: PASS | BLOCKED
    evidence: []
  spec_ref: null
  ticket_refs: []
  dependency_edges: []
  executable_frontier: []
  execution_metadata: []
  unresolved: []
  earliest_responsible_route: null
  next_legal_action: null
```

For D0/D1, fields belonging only to Matt spec/ticket execution may be `NOT_APPLICABLE` with rationale.

## Dependency verifier

`scripts/verify_matt_dependencies.py` must fail closed unless both:

1. the vendored runtime file has the pinned Git blob identity; and
2. the matching `skills-lock.json` record preserves the expected source, source type, upstream skill path, and computed hash.

The script never updates either dependency.

## Eval obligations

At minimum test:

1. normal multi-session build -> prerequisite check, exact Matt pair, receipt/frontier;
2. small reversible task -> D0/D1, do not force spec/tickets;
3. unresolved architecture -> route to `/dispel` before Matt pair;
4. Matt dependency drift -> block rather than silently continue;
5. request to "improve" Matt spec template -> refuse local modification and keep change outside this wrapper unless upstream source itself is intentionally changed;
6. spec/tickets exist but no executable frontier -> planning incomplete, not success.

## Verification lifecycle

1. static read-back;
2. exact dependency read-back;
3. dependency verifier positive and negative fixtures;
4. independent behavioral eval;
5. registered runtime discovery/invocation;
6. only then promotion/VERIFIED.

Repository presence alone does not prove runtime parity.
