# Evidence Opinion Router — Canonical Context

## Current canon

`evidence-opinion-router` now exists on `quarantine/agentic-intel-skill-canon-2026-09-07` as the pre-router for multi-type, compound, and cross-surface commands before `skill-context-builder`.

Its current routing contract is:

`user command -> evidence-opinion-router -> skill-context-builder -> downstream owners`

The router classifies task type and surfaces first. Purely deterministic compound work is handed forward without a research tax. When an evidence-backed opinion is required, it maintains separate scholarly and lived/practitioner lanes, synthesizes them in an evidence graph, recursively researches the nearest unresolved constituent variable, and stops only at a supported confidence class or evidence saturation.

## Explicit user intent retained

The implemented behavior preserves these requirements:

1. route here before `skill-context-builder` in multi-type commands;
2. classify task type and surfaces;
3. use at least 10 scholarly sources per active scholarly wave, reading only metadata/search results, abstracts, and explicit results/findings, across at least 3 materially separate axes;
4. compare scholarly evidence with lived experience before releasing an opinion;
5. when lived/practitioner evidence gains weight, use `skill-from-masters` or an equivalent proven-practitioner route to select an evidence-anchored master/persona;
6. if evidence is insufficient, fan one hop outward to the closest unresolved constituent variable and repeat;
7. if the graph continues toward lived experience, select another independent master/persona;
8. if it moves toward scholarly evidence, continue scholarly graph/wiki-style synthesis;
9. preserve the two requested confidence thresholds: `>=95` authoritative under this evidence contract; `90-94.99` research-supported but not authoritative;
10. never manufacture confidence merely to cross a threshold.

## User-owned ambiguity preserved

The exact meaning of “graph data” has not been confirmed by the user. The current implementation provisionally treats it as an internal evidence graph linking claims, sources, constituent variables, axes, contradictions/falsifiers, master/persona lenses, lane orientation, and confidence state.

If the user intended a different graph substrate, replace that mechanism while preserving the rest of this contract.

## Verified surfaces

```yaml
surfaces:
  - id: skill
    locator: skills/evidence-opinion-router/SKILL.md
    current_state: portable pre-router exists with classification, research, recursion, handoff, failure, and completion contracts
    evidence: GitHub readback blob a08de996e7505e73aa766f7b0b58badf77c2b57c
    status: VERIFIED

  - id: graph-contract
    locator: skills/evidence-opinion-router/references/evidence-graph-contract.md
    current_state: deterministic lane, confidence, ceiling, recursive-priority, and saturation semantics exist
    status: VERIFIED

  - id: scorer
    locator: skills/evidence-opinion-router/scripts/evidence_graph.py
    current_state: deterministic normalized-evidence scorer exists
    evidence: GitHub readback blob f985942bef0ee4b356f86aed63183a45750a5ad1
    status: VERIFIED_STATIC

  - id: evals
    locator: skills/evidence-opinion-router/evals/evals.json
    current_state: six trigger/routing/confidence/saturation cases exist
    evidence: GitHub readback blob 8259443a3e122a9e35b1cd446ce4e701d07ac3d6
    status: VERIFIED_STATIC

  - id: production-router
    locator: skills/production-orchestrator/SKILL.md
    current_state: explicitly routes multi-type/compound/cross-surface commands through evidence-opinion-router before skill-context-builder
    evidence: GitHub readback blob 52f14f720f51ddc8c1d32012e4769b8a73dbeb0e
    status: VERIFIED

  - id: context-builder-precedence
    locator: skills/skill-context-builder/SKILL.md
    current_state: explicitly defers first routing on multi-type/compound/cross-surface commands to evidence-opinion-router and accepts its handoff
    evidence: GitHub readback blob c129a348b843a2a7e173a02234c6288640ddbfce
    status: VERIFIED

  - id: skill-index
    locator: skills/INDEX.md
    current_state: evidence-opinion-router registered
    evidence: GitHub readback blob dcc8e2af0bbdd3f52d0f8bb5767712ba44191502
    status: VERIFIED

  - id: distribution
    locator: skills/distribution-manifest.json
    current_state: evidence-opinion-router included in project-local distribution list
    evidence: GitHub readback blob 9d899a6657b82829b97165bc0411fafb710c8309
    status: VERIFIED
```

## Deterministic score checks

The scoring behavior was exercised with normalized synthetic evidence inputs:

| Check | Observed result | Status |
| --- | --- | --- |
| Complete coverage with decision index 92.4 | `RESEARCH_SUPPORTED`, 92.4 | PASS |
| High raw score but only 9 scholarly sources | capped at 89, `INSUFFICIENT` | PASS |
| Lived/practitioner evidence materially stronger | `LIVED_PRACTITIONER` orientation | PASS |
| High raw score without falsifier search | capped at 84, `INSUFFICIENT` | PASS |

These checks validate the deterministic scoring rules only. They do not prove that every external research runtime will retrieve or normalize evidence correctly.

## Active dependencies and boundaries

- `skill-context-builder`: available and routing precedence patched.
- `agentic-intel`: available; owns atomic agentic-system external-research branches when applicable.
- scholarly-search interface: required at runtime for the scholarly lane.
- lived/community evidence interface: required at runtime for the lived-experience lane.
- `skill-from-masters`: referenced as the preferred proven-practitioner/persona route, but it is not currently bundled as a canonical top-level skill in this ToolsForCodex branch. Do not import or vendor it silently; use an available equivalent or perform a separately governed intake if local installation is required.

## Remaining delta

The skill-creation target is satisfied on the quarantine branch. Remaining work is outside the current creation target:

1. confirm or replace the provisional meaning of “graph data” if the user intended a different graph mechanism;
2. independently audit the package before promotion;
3. promote through repository governance only if explicitly requested/approved;
4. prove actual `find_skills` / `load_skill` or equivalent live runtime resolution after promotion/distribution when that lifecycle stage is requested.

No claim is made that `main` was modified or that live MCP/runtime registration has been proven.

## Current expected-state assessment

For the requested **quarantine skill creation** target, all required artifact/routing surfaces are present and read back successfully, and deterministic confidence guards pass. The package is therefore `A+` for the creation iteration under the context-builder scoring contract.

Promotion/runtime acceptance remains a separate unresolved lifecycle stage, not evidence against the completed quarantine creation target.
