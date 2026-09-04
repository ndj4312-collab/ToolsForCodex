---
name: investigate
description: Recursively investigate the gap from current state to perfected state, mapping primitives, dependencies, implementations, failures, provenance, and verification.
disable-model-invocation: false
---

# Investigate

Use after `/about` has produced a validated context artifact. Do not use a single broad research query. Recursively branch:
`idea → systems → subsystems → capabilities → primitives → dependencies → implementations → operations → lifecycle → failure modes → verification`.

For each material primitive invoke the project's capability-search/workaround discipline: search internal capabilities first, inspect exact upstream sources and delegated dependencies, compare alternatives by primitive behavior, and classify `USE | WRAP | SPECIALIZE | COMPOSE | MODIFY | EXTRACT_PATTERN | REJECT | BUILD`. BUILD is allowed only after reuse/adaptation evidence is insufficient.

Every finding must bind requirement/evidence/provenance/license/runtime assumptions/dependencies/failure modes/test-needed. Derived wiki or planning material never outranks canonical repository/runtime/Notion sources. Conflicting or stale evidence stays explicit and fail-closed.

Output a navigable research/data graph (repository-canonical form) linking requirements ↔ evidence ↔ primitives ↔ candidate capabilities ↔ adaptation decisions ↔ dependencies ↔ verification. Pass only evidence-backed findings to `/monolithize`.
