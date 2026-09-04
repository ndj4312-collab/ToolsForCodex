---
name: investigate
description: Recursively investigate the gap from current state to perfected state, mapping primitives, dependencies, implementations, failures, provenance, and verification.
disable-model-invocation: false
---

# Investigate

Use after `/about` has produced a validated context artifact. Do not use a single broad research query. Recursively branch:
`idea → systems → subsystems → capabilities → primitives → dependencies → implementations → operations → lifecycle → failure modes → verification`.

For each material primitive invoke the project's capability-search/workaround discipline: search internal capabilities first, inspect exact upstream sources and delegated dependencies, compare alternatives by primitive behavior, and classify `USE | WRAP | SPECIALIZE | COMPOSE | MODIFY | EXTRACT_PATTERN | REJECT | BUILD`. BUILD is allowed only after reuse/adaptation evidence is insufficient.

Load `../control-plane.json#research-loop`, `#adaptation-loop`, and `#workaround-loop`. Each candidate record includes exact source/revision/license, delegated skills, runtime/config/permissions/secrets/services, writes, failure modes, current compatibility evidence, functional differential, falsifier, and test. A README claim is not dependency closure. A negative claim (`no tool`, `blocked`, `custom build`, `user required`) is invalid until the ladder attempts and evidence are recorded.

Every finding must bind requirement/evidence/provenance/license/runtime assumptions/dependencies/failure modes/test-needed. Derived wiki or planning material never outranks canonical repository/runtime/Notion sources. Conflicting or stale evidence stays explicit and fail-closed.

Output a navigable research/data graph (repository-canonical form) linking requirements ↔ evidence ↔ primitives ↔ candidate capabilities ↔ adaptation decisions ↔ dependencies ↔ verification. Pass only evidence-backed findings to `/monolithize`.

Gate: material candidate questions have an evidenced route, a comparison, or explicit unresolved search branches; further search is duplicative. Red-team first-result bias, hidden delegation, runtime mismatch, license ambiguity, and duplicate primitives before advancing.
