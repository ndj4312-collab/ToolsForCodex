---
name: about
description: Build minimum-sufficient canonical context for an idea before investigation, asking only questions whose answers can materially change downstream decisions.
disable-model-invocation: false
---

# About

Use this stage when an idea lacks the minimum context required to investigate or model a perfected state. Treat repository/runtime/Notion evidence as higher authority than derived notes. Do not ask the user for facts that can be established from canonical sources or focused research.

Load `../control-plane.json#source-precedence` and `#context-frontier`. Normalize every material statement into `KNOWN | INFERRED | ASSUMED | UNKNOWN | CONFLICTED`, with source locator, observation time, and authority. A conflict never resolves by majority vote or by choosing the newest derived note.

## Deterministic contract
Input: idea plus available canonical-source locators.
Output: `context.md` (or the owning project's canonical equivalent) with: intent, desired perfected state, current state, constraints, boundaries/non-goals, resources, surfaces/runtimes, authority/permissions, canonical sources, integrations, autonomy expectations, human approval requirements, cost/time/resource constraints, unresolved variables, explicit assumptions, and domain vocabulary when useful.

Maintain an unresolved-information frontier. For each candidate question evaluate in order: `CANONICAL_SOURCE`, `RESEARCHABLE`, `ASK_USER`, or `DROP_NONMATERIAL`. Admit a user question only when the answer can materially alter perfected-state definition, constraints, current-state interpretation, investigation, architecture, or implementation planning.

Missing evidence remains `UNKNOWN` with the evidence required to resolve it. Never silently promote an assumption to fact. Persist provenance for every material source and hand the validated context artifact to `/investigate`.

Gate: do not advance until every material unknown is either resolved, explicitly non-blocking, or connected to a bounded research/user-decision branch. Record interruption-safe next action and artifact locators.
