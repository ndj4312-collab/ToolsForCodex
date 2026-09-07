# Evidence Graph Contract

Use this contract when a task requires an evidence-backed opinion.

## Graph entities

```yaml
evidence_graph:
  root_question:
  axes: []
  variables: []
  claims: []
  scholarly_sources: []
  lived_sources: []
  master_personas: []
  edges: []
  lane_scores:
    scholarly:
    lived_practitioner:
  decision_confidence:
  orientation:
  contradictions: []
  unresolved: []
```

## Allowed edge types

- `SUPPORTS`
- `CONTRADICTS`
- `QUALIFIES`
- `DEPENDS_ON`
- `GENERALIZES_TO`
- `FAILS_UNDER`
- `EXPLAINS`

Every material edge must identify its evidence record or explicitly state that it is a derived inference.

## Scoring purpose

The score is a deterministic evidence-confidence index for routing and stopping. It is not a posterior probability and must not be presented as one.

### Scholarly lane

Score each material claim on observable 0-1 values:

- `directness` — how directly the allowed text addresses the claim;
- `quality` — design/quality observable from metadata, abstract, or results only; otherwise `UNKNOWN`;
- `independence` — independence from other included evidence; shared cohorts/datasets reduce this;
- `precision` — observable precision/sample adequacy where reported; otherwise `UNKNOWN`;
- `consistency` — agreement across independent studies after preserving heterogeneity;
- `axis_coverage` — coverage of the active constituent axes;
- `falsifier_survival` — whether materially plausible contrary evidence has been sought and survived.

When a component is `UNKNOWN`, do not silently score it as perfect. Exclude it from the weighted denominator and apply an observability ceiling: a claim with more than two material `UNKNOWN` components cannot receive a scholarly claim score above 0.85.

Default scholarly weights over known components:

```text
directness        0.25
quality           0.20
independence      0.15
precision         0.10
consistency       0.15
axis_coverage     0.05
falsifier_survival 0.10
```

### Lived/practitioner lane

Score each material practical claim on:

- `context_match` 0.25
- `outcome_specificity` 0.20
- `independent_recurrence` 0.20
- `coherence` 0.10
- `adequacy` 0.10
- `failure_case_coverage` 0.10
- `falsifier_survival` 0.05

A single anecdote cannot produce a lived/practitioner lane score above 0.55 by itself. A master persona without evidence anchors contributes zero weight.

## Lane orientation

Aggregate claim scores by axis first, then aggregate axes. This prevents one densely researched axis from drowning out the other axes.

Use equal axis weights by default unless the user or governing domain contract explicitly defines different importance.

`lane_delta = scholarly_score - lived_practitioner_score`

- `lane_delta >= 0.10` -> `SCHOLARLY`
- `lane_delta <= -0.10` -> `LIVED_PRACTITIONER`
- otherwise -> `MIXED`

The 0.10 routing margin is a technical default, not a claim about statistical significance.

## Decision-confidence index

Calculate the combined index from five 0-1 components:

```text
root_claim_strength   0.30
cross_axis_convergence 0.20
source_independence   0.15
applicability         0.15
falsifier_survival    0.20
```

`decision_confidence = 100 * weighted_mean(known components)`

Apply ceilings:

- fewer than 10 scholarly sources in an active scholarly wave -> max 89;
- fewer than 3 meaningful axes -> max 89;
- no contradictory/falsifier search -> max 84;
- unresolved material contradiction on the root claim -> max 89;
- only one lived/practitioner source when that lane materially affects the opinion -> max 89;
- evidence dependence severe enough that nominal source count is misleading -> reduce effective source count before applying coverage gates.

## Recursive target selection

For each unresolved variable compute:

`priority = expected_decision_impact * uncertainty * proximity_to_root`

All terms are 0-1. `proximity_to_root` should favor the nearest unresolved constituent. Research the highest-priority variable next.

Do not claim numerical precision for these components when evidence does not support it; coarse values such as 0.25/0.5/0.75/1.0 are acceptable when justified.

## Saturation

A wave is `decision-changing` if it changes at least one of:

- root claim direction;
- material claim score by >=0.05;
- lane orientation;
- contradiction state;
- applicability boundary;
- selected next constituent variable;
- confidence class.

Two consecutive non-decision-changing waves trigger `SATURATED`. Below 90 confidence, return `INSUFFICIENT_EVIDENCE` rather than continuing indefinitely.
