---
name: production-orchestrator
description: Run a reviewed repository orchestration transaction with explicit safety gates.
disable-model-invocation: true
---

# Production Orchestrator

Use this user-invoked skill to run the complete repository orchestration workflow through explicit, reviewable gates. Start with `preflight` using an explicit configuration path.

## Routing and execution order

1. Invoke `/matt-skill-contract-audit` while validating each discovered skill's metadata, ownership, dependencies, and runtime policy.
2. Invoke `/headroom-token-minimizer` when a batch needs compact handoff context, smaller tool outputs, or claim-preserving evidence packs.
3. Invoke `/standardize-skills-to-matt-pocock` only when a human has requested a normalization patch; it may call the validator but never another user-invoked skill.
4. Run discovery and catalog generation before standardization; do not execute target-project code.
5. Run standardization and dependency-graph checks before bootstrap or adapters.
6. Compile bootstrap and one adapter per enabled runtime only after the plan is not blocked and exactly one distribution route is selected.
7. Stage target writes, verify current and staged hashes, require a matching approval file, apply atomically, and retain rollback evidence.
8. Run doctor, contract validation, lint, tests, and smoke checks before declaring the workflow complete.
9. For perfected-system planning work rather than repository orchestration, route to `/about` (minimum-sufficient context) `→ /investigate` (recursive gap mapping) `→ /monolithize` (coherent synthesis) `→ /idealize` (backward-chained executable plan); route to `/ingest-and-endure` for deterministic exhaustive corpus assimilation.
10. Invoke `skill-context-builder` whenever an orchestration, workflow, skill build, multi-agent task, or complex execution needs a canonical current-state context model, surface/dependency map, research-before-opinion routing, worker-kernel contracts, or persistent context reconciliation.
11. Invoke `/agentic-intel` when external intelligence must be researched and converted into agentic-system implications, primitives, current-surface deltas, converged proposals, or realization work. Preserve narrower exact owners and do not route generic summaries/news/non-agentic research through Agentic Intel.
12. Route to `/dispel` when the target is already frozen but the complete constituent/surface/dependency topology is not closed. `/dispel` may consume Agentic Intel evidence, but it plans/compiles only; unclear targets return to `/idealize`, and validated output proceeds through `/grill-with-docs` before `/to-spec` rather than directly to implementation.

## Inputs and outputs

Input is an explicit `orchestrator.config.json` with a target root, ignore list, allowed write roots, enabled runtimes, security mode, output directory, and exactly one distribution mode for generation/install. Outputs are deterministic catalog and diagnostics files, a standardization plan and reviewable patches, runtime adapter/equivalence artifacts, bootstrap/operator instructions, and a hash-bound transaction record.

Each stage hands off its schema-valid output and digest to the next stage. A later stage must stop if the previous output is missing, blocked, stale, or has unknown required facts.

## Operating modes

- **Audit:** Read and parse untrusted assets without executing audited-project code. Record missing facts as `UNKNOWN` and state the evidence required to resolve them.
- **Stage:** Produce a reviewed patch candidate and a transaction manifest. Preserve the source asset.
- **Apply:** Apply only a human-approved manifest after current hashes match its target files.

Never perform an implicit install, deletion, global synchronization, network request, or write. Stop when required evidence is unavailable.

## Failure and completion gates

Use `UNKNOWN` when a fact cannot be established. Fail closed on malformed metadata, parser errors that affect routing, cycles, missing skills, user-to-user dependencies, cross-skill file links, conflicting style contracts, path escapes, source drift, staged tampering, duplicate distribution routes, missing required environment variables, or runtime-equivalence differences. Recovery is to preserve source files, report the exact rule and evidence, repair the reviewable candidate, and rerun the failed gate. Overall success requires every requested runtime artifact to be equivalent in skill identity, invocation mode, dependencies, instructions digest, and security boundary; every transaction to be verified before apply; and post-apply or rollback hashes to match.
