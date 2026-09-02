# Batch Context Protocol

`context.md` is the non-canonical, batch-scoped orientation file for the next wave of work in this repository. It helps the next agent start with the smallest useful context without turning the repo into a pile of handoffs.

Authority boundaries:

- `src/` owns executable orchestration behavior.
- `contracts/` owns interchange schemas.
- `skills/` owns portable skill instructions.
- `docs/` explains architecture and compatibility.
- the Brainzzzz ledger owns durable cross-session project state.
- `context.md` owns only the current or next batch orientation.

Creating or replacing `context.md` is a repository write. It requires explicit user authorization under `AGENTS.md`; without that authorization, draft the batch context outside the repository.

## Purpose

Use this file to define the immediate operating context for one batch: what was read, what is known, what is still uncertain, which skills/MCP tools are relevant, which prerequisite files must exist before those skills run, and what the next atomic task group should do.

This file is not the project ledger, not a transcript, and not proof that mutable external state is current. Repository state, live MCP behavior, CI status, hosted services, permissions, and external docs must be reverified when they matter.

## Batch Definition

A batch is a group of atomic tasks that can be executed in one wave without notable risk of drift, hallucination, unverified dependency chaining, or context loss.

A batch may cross plan steps only when a cited active plan exists and dependencies are verified. A batch must stop at a real boundary: unresolved contradiction, consequential fork, missing dependency, irreversible/security/cost/publication action, failing acceptance evidence, or user preference.

## Lifecycle

Use one lifecycle to avoid competing versions:

1. Draft `context.md` for the next batch from current evidence.
2. Run the non-participating audit.
3. Rewrite `context.md` once to repair substantive audit findings.
4. Execute the batch or stop at a recorded blocker.
5. At batch close, update the durable ledger when the state change matters, then draft the next batch context if continuing.

Do not append endlessly. Replace stale batch context with the new batch context.

## One-Rewrite Rule

Each batch gets one substantive rewrite after non-participating audit. Typo, formatting, or broken-link fixes do not count as the substantive rewrite unless they change scope, evidence, acceptance, readiness, or execution order.

After the substantive rewrite, execute or stop. If a new critical issue appears after the rewrite, record the blocker and make it the next batch boundary unless the user explicitly authorizes a new batch context.

## Required Structure

### 1. Batch Header

- `batch_id`: non-semantic unique ID, for example `BZ-2026-09-02-001`.
- `generated_at`: ISO 8601 UTC timestamp.
- `repository_ref`: branch + commit SHA + local dirty state if applicable.
- `ledger_ref`: exact pointer only, such as page title + page ID + fetched timestamp. Do not copy durable ledger state here except the minimum batch-relevant claim with locator.
- `owner_request`: short quote or summary of the active user request.
- `batch_objective`: one sentence.
- `stop_boundary`: the condition that should stop this batch.

### 2. Quality Gate

- `QUESTION`: what must be learned, created, or changed?
- `UTILITY`: what downstream decision or execution depends on it?
- `EVIDENCE`: what would adequately support it?
- `FAILURE`: how could the batch look good but be wrong or useless?
- `ACCEPTANCE`: what observable result proves completion?

### 3. Orientation Inputs Read

Record only inputs actually read or verified.

| Input | Locator | Evidence state | Verified at | Method | What it contributes | Recheck condition |
| --- | --- | --- | --- | --- | --- | --- |

### 4. Claim Register

Separate fact classes at claim level. Every mutable claim needs freshness metadata.

| Claim | Class | Evidence locator | Verified at | Method | Used for | Recheck/expiry |
| --- | --- | --- | --- | --- | --- | --- |

Allowed classes: `KNOWN`, `INFERRED`, `UNKNOWN`, `CONFLICTED`, `NOT_ACCESSIBLE`.

### 5. Selected Skills, MCP, Scripts, and Workflows

Do not mark anything `READY` from documentation alone. Readiness requires current evidence for availability, connection/permission when applicable, input requirements, and prerequisite files.

| Surface | Trigger or command | Inputs needed | Prerequisite files/context | Output expected | Failure behavior | Readiness | Evidence locator |
| --- | --- | --- | --- | --- | --- | --- | --- |

Readiness values: `READY`, `GENERATABLE`, `INSTALL_REQUIRED`, `CONFIG_REQUIRED`, `DOCUMENT_REQUIRED`, `EXTERNAL_BLOCKED`, `UNKNOWN`, `CONFLICTED`.

### 6. Context Elicitation and Prerequisite Files

Before running a selected skill or MCP workflow, list missing context that must be elicited, generated, or hardened.

| Needed context/file | Why it is required | Source claim | How to elicit or create | Acceptance check | Status |
| --- | --- | --- | --- | --- | --- |

### 7. Atomic Task Wave

| ID | Objective | Dependencies | Evidence | Acceptance test | Status | Next |
| --- | --- | --- | --- | --- | --- | --- |

Statuses: `TODO`, `IN_PROGRESS`, `IMPLEMENTED_UNVERIFIED`, `VERIFIED`, `BLOCKED`, `EXTERNALLY_BLOCKED`, `NOT_APPLICABLE`, `SUPERSEDED`.

### 8. Execution Notes

Keep this section to no more than 10 bullets. Include only constraints that materially affect the batch: protected files, commands not to run, security boundaries, expected generated output, and known failure traps. Do not use this section for chronological narrative; durable history belongs in the Brainzzzz ledger when it matters.

### 9. Non-Participating Audit

Before execution or propagation, run a context-minimized audit with this prompt shape:

```text
You did not participate in the work. Audit this batch context against the objective, evidence, selected skills/MCP surfaces, AGENTS.md, the canonical ledger boundary, the read-only-first/write-authorization policy, and the acceptance criteria. Attack unsupported claims, missing prerequisites, stale-state risk, over-broad scope, ambiguous triggers, documentation/function mismatch, security issues, and unreproducible steps. Return only actionable findings with severity and repair.
```

Record the result:

| Finding | Severity | Repair | Applied in rewrite? |
| --- | --- | --- | --- |

### 10. Next Batch Handoff

- exact next action:
- unresolved dependencies:
- claims to reverify:
- files likely to change:
- tests or invocations to run:
- user decision needed:

## Inactive Template

If no batch is active, replace the body with:

```markdown
# Batch Context Protocol

No active batch.

Canonical state: `<ledger_ref>`.
Next step: reverify repository ref, `AGENTS.md`, and the canonical ledger before drafting the next batch context.
```

## Hygiene Rules

- Keep `context.md` compact enough to be read at session start.
- Do not store credentials, private tokens, transient secrets, or unnecessary personal data.
- Do not duplicate the canonical ledger; use exact pointers and current evidence locators.
- Do not summarize durable Brainzzzz state here except the minimum batch-relevant claim with locator.
- Do not claim repo, MCP, CI, deployment, or integration state without current evidence.
- Do not let generated docs count as evidence that runtime behavior works.
- Do not preserve superseded batch context here; preserve durable history in the canonical ledger when it matters.
- Prefer pointers and exact locators over pasted long source material.
- If no batch is active, use the inactive template above.
