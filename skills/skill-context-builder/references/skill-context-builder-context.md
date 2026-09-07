# skill-context-builder-context.md

## Canonical purpose

`skill-context-builder` is a persistent orchestration-context compiler. Invoke it semantically for orchestration work, skill design, or any task where another agent or runtime must understand the full context before acting. Its primary purpose is to fully contextualize an orchestration or skill.

It fans out questioning to discover every materially affected domain and surface, then fans back in to map dependencies, current state, target state, mechanisms of action, routing, decisions, and execution contracts. It writes and continuously maintains one canonical `<job-title>-context.md`.

The context file is not a history log. It represents current canon and the actionable delta to desired state.

## User-owned intent

The skill must not interpret, improve, normalize, or silently infer user intent.

It may:
- copy explicit user statements into structured fields;
- ask narrower questions that expose missing meaning;
- map technical consequences only after the relevant intent has been made explicit.

The user owns meaning. The skill owns finding the questions needed to expose that meaning.

Questioning continues until either:
1. the user says the branch is sufficiently contextualized; or
2. further questions would add only redundant context.

## Core output

Produce one authoritative `<job-title>-context.md` that lets a downstream orchestration runtime or agent understand without re-interviewing the user:
- every materially relevant file, surface, or constituent;
- what each contains or represents;
- current state and desired next state;
- mechanism of action from current to next state;
- goals, decisions, and reasons;
- intended mutations and their reasons;
- routing;
- active dependencies and dependency order;
- lessons and workarounds;
- expected artifacts, contents, templates/structure, and observable completion state;
- minimum context needed by each worker type.

The file is also the source model from which deterministic scripts compile worker-specific context kernels.

## Fan-out and fan-in

### Fan-out

As questioning expands, register every materially affected surface. A discovered surface becomes a planning obligation unless the user rejects or defers it.

Surface kinds can include repository, file, directory, skill, workflow, runtime, service, schema, tool, state store, interface, agent role, validator, external source, decision surface, or another task-specific constituent.

### Fan-in

As user intent becomes explicit and surface discovery stabilizes, map dependency edges, read/write relationships, current and target states, hold/release ordering, worker ownership, and evidence required to prove transition.

Parallelism is constrained by dependency ownership, not shared surface ownership. Multiple workers may touch the same surface if they do not mutate the same dependency at the same time.

If two workers require the same dependency, the context defines which writes first and which holds. After the first mutation is validated, the held worker receives refreshed context before continuing.

## Research-before-opinion routing

When a question is better answered by evidence than by user opinion, do not ask the user to choose from ignorance. Invoke `agentic-intel` with a specific atomic research target.

For conflicting findings or candidate mechanisms:
1. launch a fresh evidence-gathering subagent with no inherited conclusion;
2. inspect the materially relevant, accessible source surface, including target URL/repository plus relevant linked/internal URLs, files, commits, history, and provenance;
3. grill the returned evidence rather than accepting the subagent conclusion;
4. if conflict remains, invoke `agentic-intel` again to find analogous research or repositories supporting each claim;
5. prefer stronger demonstrated research results, then stronger implementation evidence, then the repository/mechanism most aligned with the explicit orchestration goals;
6. preserve unresolved conflicts when evidence remains tied or inaccessible.

Never claim inaccessible, deleted, private, or unobserved evidence was inspected.

## Scope expansion

Evidence may discover new scope. Only the user may authorize adding it.

When a newly discovered constituent would materially improve or enable the orchestration:
1. explain the new thing in plain language;
2. ask whether the user wants the orchestration to expand;
3. if rejected, record it as rejected/deferred outside active scope;
4. if accepted, create `<new-thing-name>-context.md`;
5. map its states, surfaces, dependencies, routing, and expected state;
6. attach it to the parent dependency graph;
7. schedule it for the next executable wave.

Parent context points to child context rather than duplicating it.

## Worker context kernels

The orchestration runtime owns worker execution. `skill-context-builder` owns the canonical model and deterministic kernel specification.

Each worker receives the minimum context required for its job, compiled mechanically from canonical context.

Every worker kernel contains:
- worker role and assigned objective;
- relevant surfaces and dependencies;
- current state and required end state;
- allowed and forbidden mutations;
- mechanism/path;
- read, write, wait, release, block, and downstream-consumer contracts;
- evidence required for completion.

Workers return a machine-readable completion record with assigned targets, completed targets, observed mutations, unchanged targets, evidence, blockers, remaining targets, dependency state after execution, and outcome.

## Persistent lifecycle

`skill-context-builder` is repeatable and persistent until end-state resolution.

1. contextualize explicit user intent;
2. fan out surfaces;
3. fan in dependencies and mechanisms;
4. write current canonical context;
5. orchestration runtime executes worker kernels;
6. observe actual changed state;
7. rerun `skill-context-builder`;
8. reconcile actual state against expected state;
9. remove stale/completed residue;
10. preserve current canon plus still-applicable routing, dependencies, lessons, and workarounds;
11. compile the next focused orchestration from the unresolved delta;
12. repeat.

The canonical context file does not grow into a transcript. Completed state becomes current canon; completed execution residue is removed; remaining work becomes the new active delta. Completed state is retained only where still required as a dependency or routing fact.

Obsolete lessons/workarounds are triaged as `FALSE` or `NEGATIVE` and sequestered outside active context.

## Failure behavior

### Failures 1 and 2

After a worker failure:
1. reconcile what changed and what did not;
2. update canonical current state;
3. remove completed targets;
4. compile a fresh kernel for remaining work;
5. launch a new worker rather than repeating stale context.

### Failure 3 at the same stage

After the third failure:
1. stop ordinary worker replacement;
2. launch a fresh contextualizing/reconciliation agent;
3. reconcile intended plan with actual failed state;
4. inspect evidence for diagnosable software, runtime, dependency, network, transport, permission, environment, stale-state, or assumption failures;
5. amend decision logs, ledger, registers, lessons, current-stage record, and plan delta;
6. present the user at least three concrete options:
   - retry the current mechanism with a fresh worker and refreshed kernel;
   - select the previously secondary/rejected Agentic Intel mechanism, reconcile it to current state, implement required changes, then retry;
   - move on while preserving exact unresolved state and dependency consequences;
7. add more evidence-backed options when genuinely distinct repair paths exist.

### Failure beyond 3 at the same stage

More than three failures at the same stage terminates the persistent resolution loop for that stage. Preserve exact current canon and unresolved targets.

## Completion and focused re-orchestration

Define expected end state before execution, including required artifacts, artifact contents, templates/structure, surface state, dependency state, and other observable properties.

Score observed final state against expected state:
- 90-100%: A+;
- 80-89%: acceptable iteration;
- below 80%: incomplete iteration.

An acceptable 80%+ iteration is not automatically terminal. If desired state has not been reached, immediately re-contextualize the remaining delta into a smaller focused orchestration. Critical missing dependencies become high-priority targets in the next iteration rather than retroactively invalidating completed work.

Persistent resolution stops when the desired state is reached or the same stage exceeds three failures.

## Canonical compaction

After each reconciliation, strip residue from `<job-title>-context.md`.

Remove completed task chatter, obsolete plans, stale intermediate state, redundant findings, and superseded worker context.

Keep when still applicable:
- current canon;
- active targets;
- routing;
- dependencies;
- lessons;
- workarounds;
- current-to-next mechanisms;
- expected-state contract;
- active decisions and mutation reasons required to understand current state.

Historical evidence belongs in decision logs, ledgers, registers, completion records, or sequestered files.

## Interfaces

### Agentic Intel request

Include atomic question, explicit orchestration goal, candidate claims/mechanisms when comparing, evidence class needed, constraints, decision metric, provenance requirement, and return format.

### Context surface

Each surface minimally exposes `id`, `kind`, `locator`, `current_state`, `target_state`, `mechanism`, `dependencies`, `routing`, `mutation_reason`, `evidence`, and `status`.

### Dependency edge

Each dependency edge minimally exposes `upstream`, `downstream`, `relationship`, `read_or_write`, `ordering`, `hold_condition`, `release_condition`, and `evidence_required`.

### Worker completion record

Each completion record exposes `worker_id`, `role`, `stage`, `assigned_targets`, `completed_targets`, `observed_mutations`, `unchanged_targets`, `evidence`, `blockers`, `remaining_targets`, `dependency_updates`, and `outcome`.

## Safety and authority

The skill may inspect authorized files, repositories, histories, and project surfaces; invoke research; launch read-only evidence subagents where runtime permits; create or rewrite context files and deterministic context-kernel artifacts; route and re-contextualize workers through the orchestration runtime.

The skill must not interpret user intent, silently expand scope, claim uninspected evidence, allow dependency write collisions, treat worker self-report as proof without observable evidence, push or publish unless separately authorized, or bypass repository/runtime safety gates.

## Acceptance tests

A conforming implementation demonstrates:
1. semantic trigger on orchestration/contextualization requests;
2. focused questioning without intent inference;
3. explicit surface registration during fan-out;
4. dependency mapping during fan-in;
5. Agentic Intel routing for research-answerable uncertainty;
6. user gate for discovered scope expansion;
7. deterministic worker-kernel contract;
8. dependency hold/release serialization;
9. fresh-worker recovery after ordinary failure;
10. three-failure reconciliation and minimum-three-option user gate;
11. residue-free canonical compaction;
12. focused re-orchestration after acceptable but incomplete iterations;
13. stop on desired state or more than three failures at the same stage.
