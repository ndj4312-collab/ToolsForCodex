---
name: dispel
description: Use when an ideal target is already frozen but the complete ecosystem required to realize it is still incomplete, foggy, shallow, duplicated, or not dependency-closed. Compile the smallest complete canonical topology of constituents, semantic owners, surfaces, interfaces, dependencies, tests, migration phases, rollback, and provenance. Plan and compile only; do not implement. Route unclear targets back to idealize and route a complete architecture/build plan onward rather than re-planning it.
compatibility: Requires a frozen IdealContract or equivalent target; may consume agentic-intel evidence and current architecture/canon; may invoke Wayfinder only for materially unresolved architecture decisions; hands accepted output to grill-with-docs before to-spec.
---

# Dispel

Turn a frozen ideal target into the smallest complete canonical ecosystem capable of realizing it.

`/dispel` owns architecture/topology compilation. It does **not** own implementation.

Read `references/dispel-context.md` when you need the full semantic contract, provenance, hard-failure rules, or the deterministic `DispelContract` shape.

## Routing boundary

Use `/dispel` when all of the following are true:

- the target is already frozen or otherwise stable enough to identify by digest;
- the complete constituent/surface/dependency topology is not yet closed;
- the user needs the smallest sufficient ecosystem, not implementation work.

Route elsewhere when:

- the target itself is unclear or changing -> `/idealize`;
- the architecture/build plan is already complete -> `/to-spec` or `/traverse` as appropriate;
- the task is evidence discovery rather than topology compilation -> `/agentic-intel`;
- the task is implementation, testing, or repair -> `/traverse`.

## Inputs

Required:

- `IdealContract` or equivalent frozen target containing a stable target identity and digest.

Optional evidence:

- current-state architecture and ADR/canon;
- `/agentic-intel` `SourceRecord[]`, `EvidenceGraph`, `PrimitiveGraph`, `CurrentSurfaceGraph`, `CandidateProposal[]`, `ConvergenceRecord`, `SurfaceImpactGraph`;
- existing specifications, routes, tests, registries, and dependency evidence;
- known conflicts, falsifiers, unknowns, and evaluators.

Treat Agentic Intel output as evidence, never authority. Preserve source -> finding -> constituent -> test provenance.

## Process

### 1. Freeze the target

Record the target identity and digest before decomposition. If the requested work changes the target rather than explaining how to realize it, stop and route the proposed change back to `/idealize`.

### 2. Inventory the current ecosystem

Read only the minimum context required to establish what already exists, where semantic ownership lives, which surfaces are canonical/runtime, and which dependencies are already satisfied.

Classify current constituents as useful, partial, inert, duplicated, conflicting, or missing when evidence supports the distinction.

### 3. Deepen architecture before adding pieces

Use the generalized design vocabulary:

`module/owner -> interface -> depth -> seam -> adapter -> leverage -> locality`

Apply these tests:

- **Deletion test:** if removing the proposed constituent changes no obligation, surface, or test seam, reject it.
- **Depth test:** prefer a deep owner with a narrow interface over a shallow wrapper that merely renames another component.
- **Interface-is-test-surface:** every important interface must expose an objective test seam.
- **Adapter test:** one adapter is only a hypothetical seam; two independent consumers establish a real seam.
- **Leverage/locality:** prefer constituents that centralize invariant behavior without spreading unrelated mutations.

### 4. Enumerate obligations and affected surfaces

Create an exhaustive set of ideal obligations and all materially affected canonical/runtime surfaces. Every active obligation and surface becomes a completion obligation.

Do not silently omit awkward, cross-cutting, migration, rollback, governance, evaluator, or runtime surfaces.

### 5. Compile constituents and owners

For each necessary constituent record:

- a stable constituent ID;
- one semantic key;
- exactly one semantic owner;
- the obligations it realizes;
- the surfaces it owns or mutates;
- interfaces and test seams;
- dependencies;
- provenance.

Reject duplicate semantic keys with conflicting owners and reject constituents that have no mapped obligation or evidence.

### 6. Close the graph

Build explicit edges for materially relevant:

- precedence;
- dependency;
- invocation;
- data flow;
- control flow;
- evidence;
- mutation ordering.

Every declared dependency must resolve to a known graph node and a corresponding edge. Hidden dependencies are a hard failure.

### 7. Resolve only material architecture decisions

If a material decision remains unresolved, invoke the Wayfinder methodology for that decision only:

1. create one decision ticket;
2. record alternatives and evidence;
3. resolve the ticket;
4. record the choice and falsifiers;
5. continue until no material architecture decision remains.

Do not use Wayfinder to reopen a frozen target.

### 8. Compile migration, rollback, tests, and denominator

Define:

- dependency-safe migration phases;
- rollback for every mutating phase;
- test seams and objective acceptance checks;
- the exact completion denominator for obligations, surfaces, owners, dependency edges, and testability.

### 9. Validate closure

Write the result as a `DispelContract` and run:

```bash
python skills/dispel/scripts/validate_contract.py <dispel-contract.json>
```

A valid contract must prove:

- frozen target identity and digest exist;
- 100% ideal obligations map to constituents and tests;
- 100% affected surfaces map to constituents and tests;
- every constituent has one semantic owner;
- semantic keys do not have conflicting owners;
- every declared dependency has a graph edge to a known node;
- no material unresolved architecture decisions remain;
- migration phases and rollback are non-empty and mapped;
- provenance exists for every constituent and test.

### 10. Handoff

Hand the frozen, validated `DispelContract` to:

`/grill-with-docs -> hardened Goal/Intent/Context -> /to-spec`

Do not route directly into implementation merely because the topology is complete.

## Hard failures

Stop and return the earliest causal defect for any of these:

- target drift;
- duplicate semantic key with conflicting owners;
- constituent with no mapped obligation/evidence;
- shallow wrapper failing deletion/depth tests;
- missing affected surface;
- hidden or dangling dependency;
- unresolved material architecture decision;
- migration phase without rollback;
- implementation route before architecture decisions close.

## Completion

`/dispel` is complete only when the validated contract demonstrates:

- 100% ideal-obligation coverage;
- 100% affected-surface coverage;
- one semantic owner per constituent and no conflicting duplicate semantic keys;
- explicit dependency edges for every declared dependency;
- objective testability;
- zero unresolved material architecture decisions;
- zero unmapped migration dependencies.
