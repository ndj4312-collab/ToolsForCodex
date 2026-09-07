---
name: evidence-opinion-router
description: Use BEFORE skill-context-builder for any multi-type, compound, or cross-surface command, and whenever a task may require an evidence-backed opinion or decision. First classify task types and affected surfaces. If no research-bearing opinion is needed, hand the classified packet directly to skill-context-builder. If an opinion is needed, triangulate at least 10 scholarly sources using only search metadata, abstracts, and explicit results, across at least 3 materially distinct constituent axes; compare that evidence with lived experience and proven-practitioner evidence; build an evidence graph; route toward skill-from-masters/persona lenses when lived-experience evidence dominates; recursively fan one hop to the nearest unresolved constituent variable until decision confidence is sufficient or evidence saturates. Never invent certainty or treat source count as truth.
compatibility: Requires skill-context-builder; a scholarly-search interface; source-native web/community evidence for lived experience; skill-from-masters or an equivalent proven-practitioner discovery skill when the lived-experience lane is active. Use agentic-intel for agentic-system research branches it already owns.
---

# Evidence Opinion Router

Classify before contextualization. Research before opinion. Let evidence determine which epistemic lane deserves more weight.

This skill is the mandatory pre-router for multi-type commands that would otherwise go directly to `skill-context-builder`.

Read `references/evidence-opinion-router-context.md` for the current intent contract and unresolved user-owned semantics. Read `references/evidence-graph-contract.md` when constructing or scoring an evidence graph. Use `scripts/evidence_graph.py` when a deterministic score calculation is possible.

## 1. Routing precedence

For a multi-type or compound command:

`user command -> evidence-opinion-router -> skill-context-builder -> downstream owners`

Do not invoke `skill-context-builder` first and then retroactively classify the task.

A command is `MULTI_TYPE` when at least two materially different work classes or evidence/surface classes are active, for example:

- research + implementation;
- research + opinion/decision;
- planning + governance;
- writing + factual adjudication;
- personal/practical decision + external evidence;
- repository change + policy/evaluation;
- multiple materially different execution surfaces with different owners.

A compound command that is entirely deterministic may still be `MULTI_TYPE`, but it does **not** automatically require the research loop.

## 2. Classify task type and surfaces

Compile a `TaskSurfaceMap` before doing deep work.

```yaml
task_surface_map:
  task_classes: []
  surfaces: []
  opinion_required: true | false
  research_answerable_uncertainty: []
  user_preference_questions: []
  deterministic_questions: []
  high_stakes_domain: true | false
  downstream_owners: []
```

Separate:

- facts that evidence can adjudicate;
- judgments that require an evidence-backed opinion;
- preferences only the user can decide;
- deterministic implementation questions;
- safety or policy gates that cannot be overridden by evidence weighting.

If `opinion_required: false`, stop the evidence loop and hand the classified packet to `skill-context-builder` immediately.

## 3. Freeze the opinion target and at least three constituent axes

Before research, state one atomic opinion target and define at least three materially distinct axes that could change the answer.

Axes must be constituent variables, not synonyms. Examples include:

- efficacy / real-world feasibility / user burden;
- reliability / maintainability / operator experience;
- measured outcome / context dependence / adoption behavior.

Do not pick axes merely to satisfy the count. Each axis must have a plausible route to changing the final opinion.

Record the root question and axis graph before source collection so later evidence cannot silently redefine the question.

## 4. Scholarly lane: minimum ten sources per research wave

When the evidence loop is active, collect at least **10 meaningfully relevant scholarly sources** in each scholarly research wave.

### Allowed reading scope

For each scholarly source, read only:

- search-result metadata;
- bibliographic metadata;
- abstract;
- an explicitly labeled results/findings section when directly accessible.

Do **not** use discussion, interpretation, conclusion, editorial framing, or unrelated full-text sections as evidence for the scholarly lane. If a result is only reported in a discussion/conclusion, mark it unavailable rather than importing it.

### Coverage requirements

- The set must cover at least three active constituent axes.
- Do not satisfy ten-source coverage with ten papers that all share the same population, dataset, laboratory, or inferential weakness when independent alternatives exist.
- Prefer systematic reviews/meta-analyses for broad effects when appropriate, then primary studies needed to resolve applicability or disagreement.
- Preserve negative, null, contradictory, and replication evidence.
- Never treat publication count as a vote.

For each source record:

```yaml
scholarly_source:
  id:
  citation:
  axis_ids: []
  study_type:
  population_or_context:
  accessed: metadata | abstract | results
  material_results: []
  directness: 0..1
  quality_observable: 0..1 | UNKNOWN
  independence: 0..1 | UNKNOWN
  precision_observable: 0..1 | UNKNOWN
  bias_flags: []
  limitations_from_allowed_text: []
  supports: []
  contradicts: []
```

Do not infer methodological quality that is not observable within the allowed reading scope.

## 5. Lived-experience and master lane

In parallel, gather lived-experience evidence relevant to the same root question and axes.

Distinguish:

- individual anecdote;
- repeated independent practitioner experience;
- qualitative research/synthesis;
- documented golden cases;
- documented failure cases;
- outcome-backed practitioner behavior.

Do not collapse these into one evidence class.

When the graph moves toward practical/lived expertise, invoke `skill-from-masters` or the environment's equivalent proven-practitioner discovery route. Use it to find people who demonstrably perform the relevant work well, real cases, failure patterns, and contrasts.

Create a `MasterPersonaRecord` as an evidence lens, not fictional roleplay:

```yaml
master_persona:
  id:
  person_or_practitioner_class:
  domain:
  why_selected:
  evidence_anchors: []
  demonstrated_outcomes: []
  actionable_practices: []
  failure_patterns: []
  context_match:
  limitations: []
  claims_supported: []
```

Never invent biography, outcomes, quotes, credentials, or experience.

## 6. Build the evidence graph

The graph is the decision surface. It contains:

- root opinion target;
- constituent-variable nodes;
- axis nodes;
- claim nodes;
- scholarly source nodes;
- lived-experience/case nodes;
- master-persona nodes;
- contradiction/falsifier nodes;
- confidence state.

Use only typed edges:

`SUPPORTS | CONTRADICTS | QUALIFIES | DEPENDS_ON | GENERALIZES_TO | FAILS_UNDER | EXPLAINS`

Do not let one source create multiple independent votes merely because it supports several wording variants of the same claim.

Read `references/evidence-graph-contract.md` for scoring and orientation.

## 7. Determine which lane the graph favors

Compute separate scholarly and lived/practitioner lane scores plus combined decision confidence.

The score is an **evidence-confidence index**, not a calibrated probability that the opinion is true. Never say “95% chance this is correct” solely because the index is 95.

Interpretation:

- scholarly lane leads materially -> continue scholarly/graph/wiki-style evidence synthesis around the closest unresolved constituent variable;
- lived/practitioner lane leads materially -> route to another independently selected relevant master persona and gather another lived/practical wave;
- neither leads materially -> preserve `MIXED`, research the highest-leverage unresolved constituent variable, and do not force a winner.

Source authority is claim-specific. Scholarship does not automatically outrank lived experience for feasibility, workflow, adoption, burden, tacit practice, or context-sensitive operational behavior. Lived experience does not automatically outrank stronger empirical evidence for causal/effect claims.

## 8. Recursive fan-out

If the evidence is not sufficient:

1. identify the unresolved constituent variable with the largest expected effect on the opinion;
2. move **one graph hop** outward from the current focus;
3. freeze that variable as the next atomic research target;
4. run another scholarly wave of at least 10 sources under the same reading restriction;
5. refresh lived-experience evidence on that variable;
6. if the lived/practitioner score gains relative weight, select another independent master persona;
7. if the scholarly score gains relative weight, continue scholarly evidence + graph/wiki synthesis;
8. recompute the evidence graph and confidence;
9. repeat only while new evidence changes a claim, axis, contradiction state, applicability boundary, or confidence state.

Do not jump several conceptual levels outward at once. “Fan slightly out” means nearest unresolved constituent first.

For agentic-system questions, delegate atomic external-research branches to `agentic-intel` when its scope applies, then import its evidence records into this graph rather than duplicating the research owner.

## 9. Confidence gates

Preserve both user-specified thresholds:

- `>=95`: may label the answer **AUTHORITATIVE BY THIS EVIDENCE CONTRACT**, while still reporting major limitations and contradictions;
- `90-94.99`: may output a **RESEARCH-SUPPORTED OPINION**, but must not call it authoritative;
- `<90`: continue the recursive loop while decision-changing evidence remains discoverable.

Never fabricate confidence to cross a threshold.

If two consecutive research waves produce no decision-changing evidence or confidence improvement, or the accessible evidence frontier is exhausted, stop with `INSUFFICIENT_EVIDENCE` even if confidence is below 90. State what remains unresolved and what evidence would be needed.

High-stakes domains may impose stricter domain-specific rules. This skill never overrides applicable safety, professional, legal, clinical, financial, or policy boundaries.

## 10. Hand off to skill-context-builder

After classification and, when needed, evidence convergence, compile the smallest authoritative packet for `skill-context-builder`:

```yaml
evidence_router_handoff:
  task_surface_map:
  root_opinion_target:
  axes:
  evidence_graph:
  scholarly_wave_count:
  scholarly_source_count:
  lived_experience_summary:
  master_personas:
  lane_orientation: SCHOLARLY | LIVED_PRACTITIONER | MIXED | NOT_APPLICABLE
  decision_confidence:
  confidence_class: AUTHORITATIVE | RESEARCH_SUPPORTED | INSUFFICIENT | NOT_APPLICABLE
  contradictions: []
  unresolved_variables: []
  downstream_owners: []
  user_owned_ambiguities: []
```

`skill-context-builder` then owns canonical execution context, dependency mapping, worker kernels, and reconciliation. Do not make this router a second orchestration-state owner.

## 11. Opinion output

When an opinion is released, state:

1. the opinion itself;
2. confidence class and evidence-confidence index;
3. which lane the graph favored and why;
4. the three or more constituent axes considered;
5. strongest supporting evidence;
6. strongest contradictory/falsifying evidence;
7. what the master/persona lane changed, if anything;
8. applicability boundaries;
9. unresolved uncertainty.

Do not hide disagreement behind a single number.

## Failure behavior

- fewer than 10 scholarly sources in an active scholarly wave -> `COVERAGE_BLOCKED` unless genuinely unavailable, then record the shortage and continue only without claiming threshold completion;
- fewer than 3 meaningful axes -> re-decompose the root question;
- inaccessible results/full results outside allowed reading scope -> record `UNAVAILABLE`; do not infer;
- duplicated or dependent sources -> down-weight independence;
- persona selected without evidence of relevance -> reject and select again;
- confidence rises only because source count rose -> reject the score change and recompute;
- conflicting evidence -> preserve contradiction and research the closest discriminating variable;
- endless research -> stop on the saturation rule, not by inventing certainty.

## Completion

Complete only when one of these is true:

- classification-only path has been handed to `skill-context-builder`;
- evidence loop reaches `AUTHORITATIVE` or `RESEARCH_SUPPORTED` output under the thresholds above;
- evidence frontier saturates and the skill returns `INSUFFICIENT_EVIDENCE` with the unresolved graph preserved.
