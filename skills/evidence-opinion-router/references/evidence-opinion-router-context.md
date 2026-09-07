# Evidence Opinion Router — Canonical Context

## Explicit user intent

The user required the new skill to:

1. route to this skill before `skill-context-builder` in multi-type commands;
2. classify task type and surfaces;
3. research 10 scholarly sources, reading only results and abstracts, and use evidence meaningfully relevant on at least 3 separate axes alongside lived experience before offering an opinion until graph data points toward one or the other as source of truth; if graph data points toward lived experience, point toward a person/persona from `skill-from-masters`;
4. use the master/persona for insight; if the research plus insight is not enough to provide an authoritative 95% confidence answer, repeat research while fanning slightly outward each time to the closest constituent variable from the initial focus; if movement continues toward lived experience, route to another persona;
5. if graph data moves toward scholarly sources, continue graph/wiki-style synthesis until confidence reaches 90% or higher and output an opinion based on research.

## Preserved ambiguity

The exact meaning of “graph data” is user-owned and not yet confirmed. Current implementation provisionally treats it as an internal evidence graph linking claims, sources, variables, axes, contradictions, personas, and confidence. If the user means a different graph substrate, replace that mechanism without changing the rest of the intent contract.

The user supplied two thresholds. They are preserved rather than merged:

- 95 = authoritative under this evidence contract;
- 90-94.99 = research-supported opinion but not authoritative.

## Current target state

A portable skill named `evidence-opinion-router` exists and is routed before `skill-context-builder` for multi-type commands. It performs classification first and only runs expensive evidence research when an evidence-backed opinion is actually required.

## Surface map

```yaml
surfaces:
  - id: new-skill
    kind: skill
    locator: skills/evidence-opinion-router/SKILL.md
    current_state: missing
    target_state: portable triggerable pre-router
    mechanism: create via skill-creator conventions
    dependencies: [skill-context-builder, scholarly-search, lived-evidence, skill-from-masters]
    routing: before skill-context-builder on multi-type commands
    mutation_reason: explicit user requirement
    status: ACTIVE

  - id: graph-contract
    kind: reference
    locator: skills/evidence-opinion-router/references/evidence-graph-contract.md
    current_state: missing
    target_state: deterministic graph/scoring/stopping contract
    mechanism: bundled reference
    dependencies: [new-skill]
    routing: load when evidence loop is active
    mutation_reason: confidence and graph behavior require deterministic semantics
    status: ACTIVE

  - id: router
    kind: skill
    locator: skills/production-orchestrator/SKILL.md
    current_state: routes complex work directly to skill-context-builder
    target_state: evidence-opinion-router precedes skill-context-builder for multi-type commands
    mechanism: minimal routing patch
    dependencies: [new-skill]
    status: ACTIVE

  - id: context-builder-trigger
    kind: skill
    locator: skills/skill-context-builder/SKILL.md
    current_state: may trigger first on complex/multi-agent jobs
    target_state: defer first classification to evidence-opinion-router for multi-type commands
    mechanism: trigger/precedence clarification
    dependencies: [new-skill]
    status: ACTIVE

  - id: skill-index
    kind: registry
    locator: skills/INDEX.md
    current_state: skill absent
    target_state: skill registered
    mechanism: append canonical pointer
    dependencies: [new-skill]
    status: ACTIVE

  - id: distribution
    kind: registry
    locator: skills/distribution-manifest.json
    current_state: skill absent
    target_state: skill included in project-local distribution
    mechanism: add identifier
    dependencies: [new-skill]
    status: ACTIVE
```

## Dependency order

1. freeze user intent and unresolved semantics;
2. create graph contract;
3. create skill body;
4. validate skill frontmatter and bundled paths;
5. register skill in index/distribution;
6. patch production router;
7. patch context-builder precedence;
8. read back all changed files and verify routing consistency;
9. run trigger/evidence-loop static evals;
10. keep branch quarantined until independent promotion gate.

## Research-derived design constraints

Evidence-synthesis methods support explicit certainty assessment, triangulation across evidence with different weaknesses, preservation of inconsistency/indirectness/imprecision, and separate treatment of qualitative/lived-experience confidence. The skill therefore must not reduce truth to source counts or make the 90/95 thresholds look like calibrated probabilities.

`skill-from-masters` is used only for the practical-expert/persona lane. Its proven-practitioner/golden-case/failure-case orientation is complementary to, not a substitute for, scholarly evidence.

## Expected-state contract

A+ target (90-100):

- all six active surfaces above reach target state;
- multi-type routing order is explicit in both router and context-builder;
- evidence research is not triggered for purely deterministic classification-only paths;
- active scholarly wave requires >=10 sources and >=3 axes;
- allowed scholarly reading scope is explicit;
- scholarly and lived/practitioner lanes remain separate until graph synthesis;
- persona selection is evidence-anchored and repeatable when lived evidence strengthens;
- recursive fan-out is one constituent hop at a time;
- 95/90 thresholds are both preserved;
- saturation prevents infinite loops and invented confidence;
- static skill validation and readback pass.

80-89 is an acceptable iteration but does not end the context loop while active gaps remain.
