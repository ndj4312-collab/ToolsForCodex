---
name: skill-context-builder
description: Use whenever an orchestration, skill, workflow, agentic build, multi-agent task, or complex job needs to be fully contextualized before or during execution. Persistently fan out to discover affected surfaces, fan in to map dependencies/current-to-next mechanisms, route research-answerable uncertainty to agentic-intel instead of guessing, maintain a residue-free canonical <job-title>-context.md, and compile minimum worker context kernels for the orchestration runtime until desired state is reached or the same stage exceeds three failures. Also use as a context wrapper for non-orchestration tasks when another skill or agent needs an authoritative current-state context file.
compatibility: Requires an orchestration runtime capable of invoking workers; agentic-intel when evidence/research routing is needed; filesystem or document access for canonical context maintenance.
---

# Skill Context Builder

Build and continuously maintain the authoritative context model that an orchestration runtime executes against.

Do not own worker execution. Own the context that controls worker execution.

## Operating loop

1. **Capture explicit intent.** Copy what the user actually said. Do not reinterpret, improve, normalize, or silently infer their meaning.
2. **Question toward specificity.** Ask one narrow, plain-language question at a time only where surrounding meaning is still missing.
3. **Stop questioning a branch** when the user says it is enough or another question would add only redundant context.
4. **Fan out surfaces.** Register every materially affected file, repository, skill, workflow, runtime, schema, tool, agent role, state store, validator, or other constituent.
5. **Fan in dependencies.** Map current state, next state, mechanism, routing, mutation reason, dependency edges, hold/release order, and proof required for each transition.
6. **Route research before opinion.** When evidence can answer a question better than user preference, invoke `agentic-intel` with an atomic research target.
7. **Write `<job-title>-context.md`.** Make it the canonical current-state model and source for worker kernels.
8. **Hand worker execution to the orchestration runtime.** Compile the smallest context kernel each worker needs.
9. **Reconcile after execution.** Observe what changed, rewrite current canon, strip residue, and compile the unresolved delta.
10. **Repeat** until desired state is reached or the same stage exceeds three failures.

Read `references/skill-context-builder-context.md` when you need the complete contract, interfaces, failure semantics, or acceptance rules.

## Intent boundary

The user owns meaning.

Never convert ambiguous intent into a technical decision by inference. Preserve ambiguity and ask a narrower question.

You may infer technical consequences only after the relevant user-owned meaning has become explicit.

## Fan-out: register surfaces

As questioning expands, turn each materially affected domain into an explicit surface record.

A discovered surface becomes a planning obligation unless the user rejects or defers it.

For each surface capture at minimum:

```yaml
id:
kind:
locator:
current_state:
target_state:
mechanism:
dependencies: []
routing:
mutation_reason:
evidence: []
status:
```

Do not let downstream planning omit a registered active surface silently.

## Fan-in: map dependencies and execution constraints

Map dependency relationships after surfaces are known.

Parallelize by dependency ownership, not surface ownership.

Different workers may touch the same surface when they own different dependency closures. If two workers must mutate the same dependency, serialize them:

1. identify which mutation is prerequisite;
2. let that worker write;
3. hold the other worker;
4. validate the dependency transition;
5. refresh canonical context;
6. regenerate the held worker's kernel;
7. release it.

Represent dependency coordination with:

```yaml
writes: []
reads: []
waits_for: []
releases: []
blocked_by: []
downstream_consumers: []
```

## Research and conflict resolution

When a question is research-answerable, invoke `agentic-intel` instead of asking the user for a technical opinion.

For conflicting findings or candidate mechanisms:

1. send a fresh evidence-gathering agent to the materially relevant accessible source surface;
2. inspect relevant repository files, linked/internal sources, commits/history, and provenance where available;
3. grill the evidence rather than trusting the subagent's conclusion;
4. if conflict remains, invoke `agentic-intel` again for analogous evidence supporting each claim;
5. prefer stronger qualifying research results, then stronger implementation evidence, then closer alignment to the explicit orchestration goal;
6. preserve unresolved conflict when evidence cannot distinguish the options.

Never claim inaccessible or unobserved evidence was inspected.

## Scope expansion gate

Evidence may discover new scope. Only the user may authorize adding it.

When a new constituent is needed:

1. explain it in plain language;
2. ask whether the orchestration should expand;
3. if no, classify it rejected/deferred outside active scope;
4. if yes, create `<new-thing-name>-context.md`;
5. map that constituent independently;
6. attach it to the parent dependency graph;
7. place it in the next executable wave.

Do not duplicate child context into the parent.

## Compile worker kernels

Use `scripts/context_state.py kernel` when the canonical context contains a machine-readable context-state block.

Each worker gets only the context required for its work:

- role and objective;
- relevant surfaces;
- relevant dependencies;
- current state;
- required end state;
- mechanism/path;
- allowed and forbidden mutations;
- read/write/wait/release contracts;
- completion evidence.

Require a machine-readable completion record from each worker.

Read `references/worker-kernel-contract.md` for the exact worker packet and completion-record shapes.

## Reconciliation and persistence

This skill remains active across execution cycles.

After every worker batch or material state change:

1. compare expected state to observable actual state;
2. record what changed and did not change;
3. promote proven changes into current canon;
4. remove completed targets from active work;
5. retain completed state only when still required as routing/dependency context;
6. preserve still-applicable routing, dependencies, lessons, and workarounds;
7. triage obsolete lessons/workarounds as `FALSE` or `NEGATIVE` outside active canon;
8. rewrite `<job-title>-context.md`;
9. compile the next focused orchestration from the remaining delta.

Do not turn the canonical context into a transcript.

## Failure handling

### Failure 1 or 2 at a stage

Do not retry the same stale worker prompt.

Reconcile actual state, remove completed targets, compile a fresh kernel for the remaining work, and launch a new worker.

### Failure 3 at the same stage

Stop ordinary retry and launch a fresh contextualizing/reconciliation agent.

Require it to:

- reconcile intended plan with actual failed state;
- inspect emitted evidence for software, runtime, network, transport, permissions, environment, dependency, stale-state, or invalid-assumption causes;
- update decision logs, ledger, registers, lessons, current-stage state, and affected plan delta.

Then present the user at least:

1. retry the current mechanism with refreshed context;
2. switch to the previously secondary/rejected Agentic Intel mechanism, reconcile it to current state, implement required changes, and retry;
3. move on while preserving exact unresolved state and dependency consequences.

Add further evidence-backed options when useful.

### Failure beyond 3 at the same stage

Stop the persistent loop for that stage and preserve exact unresolved current canon.

## Completion and iteration scoring

Define expected state before execution, including:

- artifacts;
- artifact contents;
- templating/structure;
- surface state;
- dependency state;
- other observable completion properties.

Compare observed state against that contract:

- `90-100%` = A+;
- `80-89%` = acceptable iteration;
- `<80%` = incomplete iteration.

An 80%+ iteration does not terminate the skill unless desired state is actually reached.

Re-contextualize the remaining delta and immediately make the next focused orchestration executable.

## Canonical compaction

Keep `<job-title>-context.md` limited to what is true and actionable now.

Remove completed chatter, obsolete plans, stale intermediate state, redundant findings, and superseded worker context.

Keep still-applicable:

- current canon;
- active targets;
- routing;
- dependencies;
- lessons;
- workarounds;
- current-to-next mechanisms;
- expected-state contract;
- decisions and mutation reasons required to understand current state.

Use `assets/context-template.md` for the output shape.

## End condition

Continue the persistent context loop until either:

- desired state is reached; or
- the same stage exceeds three failures.

Do not declare end-state resolution merely because workers reported completion.
