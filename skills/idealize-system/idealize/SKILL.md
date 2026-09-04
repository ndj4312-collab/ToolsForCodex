---
name: idealize
description: Turn an idea into the closest realistically achievable perfected agentic system, then backward-chain it to a phase/wave/atomic executable implementation plan with objective evidence gates.
disable-model-invocation: false
---

# Idealize

Invoke as `/idealize <idea>`. Load `../control-plane.json`, `../capability-registry.json`, and `../../../contracts/ideal-project-plan.schema.json`. Orchestrate `/about → /investigate → /monolithize → /idealize`; reuse validated upstream outputs when they are current instead of rerunning work blindly.

For every perfected capability backward-chain until immediately buildable primitives are reached. At each node ask: what must exist immediately before this; what enables it; whether it already exists; whether reuse/wrapper/specialization/composition suffices; whether a capability/workaround search reveals a better mechanism; which surface/runtime owns it; what authority is required; what can run in parallel; and how completion is objectively proven.

Compile the reverse dependency chain into forward execution order:
`Perfected State → Gap → Primitive → Dependency → Phase → Wave → Atomic Task → Verification → Canonical State`.

Primary output: `the-ideal-project-plan.md`; also emit `ideal-project-plan.json` as its machine-checkable semantic companion. Every atomic task MUST contain: task ID, requirement, rationale, owner, inputs, prerequisites, capability, owning surface/runtime, permissions, execution class, read/write set, output, phase/wave, parallel status, acceptance evidence, failure condition, executable IF/THEN branch, workaround, fallback, rollback, escalation, downstream unlocks, and canonical destination. Dependency edges MUST use explicit relations: `REQUIRES | BLOCKS | PARALLEL_WITH | CONFLICTS_WITH | PRODUCES | CONSUMES | VERIFIES | FALLBACK_FOR`.

Validate the JSON companion with the schema and `src/idealize/engine.ts`. Reject dependency cycles, dangling edges, orphan requirements/tasks, evidence-free tasks, non-executable branches, and unsafe parallel writes. A wave may start only when its prerequisites and preceding gate evidence are satisfied.

## Control loop
For every missing capability, blocker, failed integration/test/dependency, runtime limitation, or proposed BUILD, route:
`correct invocation → config/dependency repair → alternate existing capability → alternate authorized surface/runtime → wrapper/adapter → composition → equivalent open-source mechanism → bounded modification → smallest new implementation → privileged/user escalation`.
A blocked branch does not stop independent branches.

Continuously red-team decomposition, capability selection, architecture, plan compilation, and evidence. Every material discovered implementation failure becomes a regression fixture before repair. Fail closed on stale/conflicting canonical evidence, missing provenance/license for adaptations, unresolved transitive dependencies, unsafe authority assumptions, or claimed verification without evidence.

Completion means the output plan is executable by a context-agnostic human/agent and every perfected requirement traverses to evidence, primitive, capability/adaptation, owner, task, verification, and canonical destination.

Before completion, run the reference fixture in `test/fixtures/idealize/reference-plan.json`, then a context-specific end-to-end stress test. Run a context-minimized challenger, convert each material failure into a regression fixture, repair, and repeat until no critical/high finding remains and new passes are duplicative or non-material. Repository promotion and live MCP proof are separate terminal gates; never self-certify them from source inspection.
