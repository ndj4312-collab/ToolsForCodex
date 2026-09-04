# Active Batch Context

## 1. Batch Header

- `batch_id`: GHC-2026-09-02-001
- `generated_at`: 2026-09-02T06:26:27Z
- `repository_ref`: `main` at `8f9f08870c3e317d9f3008b68f4953bad75a16d6`; local clone clean before edits.
- `ledger_ref`: `SECOND_BRAIN_AGENT_ENVIRONMENT_LEDGER`, page ID `3ce74bf7-051b-81b3-9414-cf0c0b049cd0`, fetched at `2026-09-02T05:59:04.131Z`.
- `owner_request`: "Execute next batch."
- `batch_objective`: Reconcile GitHub canon status on `main`, create the first active batch context, and establish the adding-repo protocol before any starred repository import.
- `stop_boundary`: Stop before importing, executing, installing, or vendoring any external repository; stop if repo state diverges, credential hygiene fails, or protocol audit finds unresolved high-severity gaps.

## 2. Quality Gate

- `QUESTION`: Is ToolsForCodex `main` canonical and ready to receive a reviewed adding-repo protocol?
- `UTILITY`: Starred repository triage/import and headroom evaluation depend on a documented, auditable, no-execution intake protocol.
- `EVIDENCE`: GitHub branch readback, local git clone/status, branch comparison, docs search, protocol file, read-only dry run, non-participating audit, remote readback after push, and ledger update.
- `FAILURE`: The batch could look complete while hiding branch divergence, importing before protocol, leaking credentials, treating metadata as legal/security approval, or creating a protocol that cannot be applied reproducibly.
- `ACCEPTANCE`: `context.md`, `docs/adding-repo-protocol.md`, and the AGENTS pointer are committed and pushed to `main`; remote readback verifies the files; `git diff --check` and credential scans pass; the ledger records the new commit and next batch.

## 3. Orientation Inputs Read

| Input | Locator | Evidence state | Verified at | Method | What it contributes | Recheck condition |
| --- | --- | --- | --- | --- | --- | --- |
| Canonical ledger | Notion page `3ce74bf7-051b-81b3-9414-cf0c0b049cd0` | KNOWN | 2026-09-02T05:59:04.131Z | Notion fetch | Batch scope, task IDs, hard no-import gate | Each session and before ledger write |
| GitHub `main` branch | GitHub API `/repos/ndj4312-collab/ToolsForCodex/branches/main` | KNOWN | 2026-09-02T06:17Z | GitHub connector fetch | Remote SHA and branch protection | Before push or downstream reliance |
| Local clone | `/workspace/scratch/37eddc485a59/ToolsForCodex-batch-1788330319` | KNOWN | 2026-09-02T06:14Z | Token-backed `git clone` | Clean local worktree matching remote `main` | Before commit |
| Branch comparison | `origin/tools..origin/main`, `origin/main..origin/tools` | KNOWN | 2026-09-02T06:19Z | Unshallowed git fetch + rev-list | `main` ahead 6, `tools` no unique commits | Before branch reconciliation decisions |
| AGENTS instructions | `AGENTS.md` on `main` | KNOWN | 2026-09-02T06:17Z | GitHub fetch + local read | Read-only-first, write/push authorization, context boundary | Before write scope changes |
| Existing context protocol | `context.md` at `8f9f088...` | KNOWN | 2026-09-02T06:17Z | GitHub fetch + local read | Required active batch structure | Before replacing context |
| Docs inventory | `docs/` on `main` | KNOWN | 2026-09-02T06:17Z | GitHub contents + local find | Confirms no existing adding-repo protocol | Before create/update path |
| Existing protocol search | repo `rg` for import/add/starred terms | KNOWN | 2026-09-02T06:26Z | Local `rg` | Confirms create path | If docs tree changes |
| GitHub API note | Scratch attachment path | KNOWN | 2026-09-02T06:14Z | Local read by shell only | Supplies token material for authenticated Git/API without exposing it | Each token-backed operation |

## 4. Claim Register

| Claim | Class | Evidence locator | Verified at | Method | Used for | Recheck/expiry |
| --- | --- | --- | --- | --- | --- | --- |
| `main` is current canon for this batch. | KNOWN | `origin/main` `8f9f088...`; `origin/tools` has 0 unique commits after unshallow fetch | 2026-09-02T06:19Z | `git rev-list` | Avoid unnecessary branch merge | Recheck before push |
| `main` is unprotected in connector branch metadata. | KNOWN | GitHub branch fetch | 2026-09-02T06:17Z | GitHub connector | Push risk assessment | Recheck before assuming governance |
| Existing docs lack an adding-repo protocol. | KNOWN | docs inventory + `rg` no matches | 2026-09-02T06:26Z | GitHub/local search | Create new doc | Recheck if concurrent edits appear |
| GitHub connector writes are blocked. | KNOWN | Ledger evidence from prior batch | 2026-09-02T05:59:04Z | Notion fetch | Use token-backed local git for push | Re-test only if connector write is needed |
| Token-backed local Git works. | KNOWN | Successful clone of current repo | 2026-09-02T06:14Z | Local git with auth header | Clone/push path | Recheck on push |
| Starred repos are not yet safe to import. | KNOWN | Ledger GHC-012 and this stop boundary | 2026-09-02T05:59:04Z | Notion fetch | Prevent premature ingestion | Recheck after GHC-010/GHC-012 |
| A sample repo can be dry-run without import or execution. | INFERRED | Public GitHub metadata can be fetched read-only | 2026-09-02T06:26Z | Protocol design | GHC-008 candidate | Verify during dry run |

## 5. Selected Skills, MCP, Scripts, and Workflows

| Surface | Trigger or command | Inputs needed | Prerequisite files/context | Output expected | Failure behavior | Readiness | Evidence locator |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Notion knowledge capture | Fetch/update ledger | Ledger page ID, enhanced Markdown spec before update | Current ledger content | Current state and session entry updated | Stop if Notion update unavailable | READY | Notion skill read and ledger fetch |
| GitHub connector read | Branch/file/contents fetch | Public repo locators | Repo full name and paths | Remote evidence and readback | Fall back to local git/API for public reads | READY | Successful branch/file fetches |
| Token-backed local Git | clone/fetch/commit/push | User-supplied token in scratch, never printed | Clean local clone | Repo mutation and verification path | Stop on auth failure or dirty conflict | READY | Successful clone/fetch |
| Local shell inspection | `git status`, `git diff`, `rg`, `find` | Local clone | AGENTS/context read | Snapshot, searches, hygiene checks | Record UNKNOWN or failure | READY | Local commands |
| Non-participating audit | `multi_agent_v1.spawn_agent` / `multi_agent_v1.wait_agent` | Draft context and protocol content | Minimized audit prompt | Actionable findings before push | Repair or stop | READY | Audit `01a060d0-913c-7d20-bbf0-aabe1bd58016` completed |
| Adding-repo protocol | `docs/adding-repo-protocol.md` | Requirements, threat model, dry-run sample | This batch context | Gate document for future repo intake | Stop imports until committed/read back | GENERATABLE | Ledger plan + repo docs search |
| Read-only protocol dry run | GitHub metadata/static file fetch for `public-apis/public-apis` | Public repo metadata, branch, README excerpt, LICENSE, root contents | No target code execution | Protocol friction and gaps recorded | Repair protocol or stop | READY | GitHub connector fetches |

## 6. Context Elicitation and Prerequisite Files

| Needed context/file | Why it is required | Source claim | How to elicit or create | Acceptance check | Status |
| --- | --- | --- | --- | --- | --- |
| `docs/adding-repo-protocol.md` | Required before starred import or external repo modification | GHC-005..GHC-012 | Create from requirements and threat model, audit, dry run | Remote readback after push | IN_PROGRESS |
| Read-only dry-run record | Ensures protocol can actually be applied | GHC-008 | Apply checklist to one public sample repo without cloning/executing code | Gaps repaired or recorded | VERIFIED |
| Starred repo source registry | Needed for future import queue | STAR-003/004 | Later authenticated API pagination | Metadata only, no token leakage | TODO |
| Duplicate baseline | Needed before importing external capabilities | STAR-012/013 | Corrected ToolsForCodex inventory | Mechanism-level comparison exists | TODO |
| Headroom exact repo locator | Needed before token-shrinking evaluation | HEAD-001 | Locate from starred inventory or ask user | Full name/URL verified | TODO |

## 7. Atomic Task Wave

| ID | Objective | Dependencies | Evidence | Acceptance test | Status | Next |
| --- | --- | --- | --- | --- | --- | --- |
| GHC-001 | Snapshot current repo state before mutation | Ledger, GitHub read, local clone | Remote/local SHA `8f9f088...`, clean clone, branch protection off, branch comparison, docs inventory | Snapshot recorded in this file | VERIFIED | Continue |
| GHC-002 | Define `canon status on main` criteria | GHC-001 | Criteria in this context | Criteria covers remote/local equality, pushed commit, context/protocol presence, ledger update, clean worktree, no unresolved conflict | VERIFIED | Apply criteria |
| GHC-003 | Reconcile sources of truth | GHC-001,GHC-002 | Ledger, GitHub, local clone, AGENTS, context, docs inventory | Conflicts explicit; no tools-to-main merge needed | VERIFIED | Continue |
| GHC-004 | Inspect existing repo-protocol docs | GHC-001 | `rg` returned no adding/import protocol matches | Create vs update path chosen | VERIFIED | Create protocol |
| GHC-005 | Extract adding-repo protocol requirements | GHC-004 | Requirements in protocol draft | Covers intake, license, security, no-exec, dedupe, context cost, branch/quarantine, rollback, ledger | VERIFIED | Audit |
| GHC-006 | Threat-model added repositories | GHC-005 | Threat model in protocol draft | Risks and mitigations explicit | VERIFIED | Audit |
| GHC-007 | Draft `docs/adding-repo-protocol.md` | GHC-005,GHC-006 | New doc in local clone | Stages, hard gates, queue states, kill criteria, failure behavior present | VERIFIED | Audit |
| GHC-008 | Dry-run protocol without importing | GHC-007 | `public-apis/public-apis` metadata, branch, README excerpt, LICENSE, root contents | No code execution; friction/gaps recorded | VERIFIED | Run audit |
| GHC-009 | Non-participating audit of protocol | GHC-008 | Audit `01a060d0-913c-7d20-bbf0-aabe1bd58016` | High/material gaps repaired or recorded | VERIFIED | Push after checks |
| GHC-010 | Commit and push adding-repo protocol | GHC-009 | Git commit + remote readback | New commit on `main` | TODO | Push after checks |
| GHC-011 | Update ledger and canon status | GHC-010 | Notion update | Current state and session entry updated | TODO | Finalize |
| GHC-012 | Hard gate starred imports | GHC-010 | Protocol committed/read back | No starred import before gate | TODO | Enforce next batch |

## 8. Execution Notes

- Do not import, install, build, test, or execute any external repository in this batch.
- Do not print, commit, summarize, or persist token values or auth headers.
- Treat starred repositories and all third-party repo content as untrusted input.
- Use `UNKNOWN` instead of guessing license/security/session compatibility.
- Prefer metadata and static file reads for dry runs.
- Commit protocol only after read-only dry run and non-participating audit repairs.
- This `context.md` replaces the protocol body for the active batch; durable history remains in the Notion ledger.

## 9. Non-Participating Audit

| Finding | Severity | Repair | Applied in rewrite? |
| --- | --- | --- | --- |
| `docs/adding-repo-protocol.md` was untracked, so a commit could leave `AGENTS.md` pointing at a missing file. | High | Stage the new protocol before commit and verify `git status --short` shows it as added. | Yes; staging is part of GHC-010 checks |
| `context.md` still said the audit was pending and GHC-009 was TODO. | High | Record the audit findings and mark GHC-009 verified only after repairs. | Yes |
| Dry-run evidence locators were too vague for reproduction. | Medium | Add exact GitHub API/file locators and response identifiers used in the dry run. | Yes |
| Audit surface readiness cited only tool exposure, not the actual completed audit. | Medium | Cite the completed audit mechanism and agent ID. | Yes |

Read-only dry-run record:

| Field | Value |
| --- | --- |
| Candidate | `public-apis/public-apis` |
| Source | Public GitHub sample selected for protocol dry run, not from starred import queue |
| Observed at | 2026-09-02T06:35Z |
| Default branch | `master` at `9d0426870ee7edc9ffedf21cc5b2e87604819549` |
| Access state | `METADATA_READABLE`, `STATIC_FILES_READABLE` |
| Useability state | `REFERENCE_ONLY` for this dry run; no import attempted |
| License state | `LICENSE_OK_FOR_REFERENCE`; MIT metadata and LICENSE read |
| Security screen | `UNKNOWN`; root contents show `.github` and `scripts`, not inspected deeply because dry run only tested protocol shape |
| Mechanism | Curated public API directory/list with README-heavy content |
| Existing overlap | `UNKNOWN`; full duplicate baseline not yet generated |
| Fundamental difference | Not evaluated because no import decision was attempted |
| Queue state | `REFERENCE_ONLY` for dry-run purposes |
| Evidence locators | `https://api.github.com/repos/public-apis/public-apis`; `https://api.github.com/repos/public-apis/public-apis/branches/master`; `https://api.github.com/repos/public-apis/public-apis/contents?ref=master`; `README.md` lines 1-80 at `master` with blob SHA `ade44e71b5e2246565541b7c5813effc3d9de06b`; `LICENSE` lines 1-80 at `master` with blob SHA `196b23b178fbf71317fc55c3d3e01d481b5760e5` |
| No-exec confirmation | Yes; no clone, install, build, test, script, hook, notebook, binary, or container execution |
| Decision rationale | Protocol fields were sufficient for metadata/license/static access; dry run exposed need for a reusable intake record template, now added to protocol |
| Next action | Run non-participating protocol audit before commit/push |

## 10. Next Batch Handoff

- exact next action: Run STAR-001/STAR-003 style access inventory only after GHC-010/GHC-012 are verified.
- unresolved dependencies: full starred repo pagination, duplicate baseline inventory, headroom repo locator, connector write permission status.
- claims to reverify: remote `main` SHA, branch protection, token-backed auth, Notion ledger current state, no token leakage.
- files likely to change: `context.md`, possible intake registry under `docs/` or generated output path, ledger.
- tests or invocations to run: read-only GitHub API pagination, no-exec static metadata inspection, duplicate analysis once inventory exists.
- user decision needed: if private starred repositories appear, decide whether they may be cataloged and what metadata can be persisted.

## 11. Starred Repo Batch Update

Observed at: 2026-09-02 current session.

User correction: Do not down-rank starred repos as `REFERENCE_ONLY` during the access/useability batch. The required classification is where and how each repo can be used: cloud session, local session, remote MCP/static session, needs modification, or blocked. Import/adaptation value is decided only after static evidence, license review, duplicate analysis, and explicit integration design.

Batch results:

- Authenticated `/user/starred` access succeeded using the provided scratch token file without printing or committing token material.
- Starred repository count: 62.
- Current GitHub connector can read public repository metadata/static files but does not expose authenticated `/user/starred`; added `scripts/starred-repo-intake.mjs` so local/cloud sessions can reproduce star inventory with `GITHUB_TOKEN` or `GH_TOKEN`.
- Direct ToolsForCodex overlap candidates identified: 14.
- Quarantine shallow clones completed for the 14 direct-overlap candidates under ignored `quarantine/starred-2026-09-02/`.
- Target repo execution performed: none.

Direct-overlap quarantine set:

- `TencentCloud/TencentDB-Agent-Memory`
- `VoltAgent/awesome-agent-skills`
- `VoltAgent/awesome-claude-code-subagents`
- `VoltAgent/awesome-design-md`
- `ai-boost/awesome-prompts`
- `alibaba/page-agent`
- `e2b-dev/awesome-ai-agents`
- `enescingoz/awesome-n8n-templates`
- `github/awesome-copilot`
- `hanishrao/collective-ai-tools`
- `tashfeenahmed/freellmapi`
- `travisvn/awesome-claude-skills`
- `tt-a1i/archify`
- `zhaoxuya520/reverse-skill`

Files changed this batch:

- `.gitignore`: ignore `.work/` and `quarantine/`.
- `eslint.config.mjs`: ignore `.work/**` and `quarantine/**` so local quarantine pulls are not linted as ToolsForCodex source.
- `scripts/starred-repo-intake.mjs`: token-safe GitHub starred repo inventory/classifier with `--from-file` verification mode.
- `package.json`: adds `starred:intake`.
- `docs/starred-repo-intake.md`: records full 62-repo inventory and next direct-overlap integration actions without `REFERENCE_ONLY` queue decisions.

Verification completed:

- `git clone` of `ndj4312-collab/ToolsForCodex` succeeded; worktree started clean.
- Authenticated curl pagination produced 62 starred repo metadata records.
- `git clone --depth 1` succeeded for all 14 direct-overlap candidates.
- `node --check scripts/starred-repo-intake.mjs` passed.
- `node scripts/starred-repo-intake.mjs --from-file .work/starred-intake/starred-repos.json --format json` passed and reproduced 62 classified records.
- `npm run build` passed.
- `npm test -- --runInBand` passed: 5 suites, 14 tests.
- `npm run lint` passed after excluding ignored quarantine/scratch evidence directories from ESLint.

Verification caveat:

- Live Node HTTPS mode for `scripts/starred-repo-intake.mjs` was not verified inside this Work sandbox because the environment blocked Node outbound network. Equivalent GitHub API access was verified with curl, and the script's file-input parser/classifier was verified locally.

Next exact work:

1. Run license file reads for the 14 direct-overlap candidates.
2. Generate duplicate baseline from `skills-lock.json`, `skills/`, `approved-proposals/`, and `pointer-catalog/`.
3. Extract import/adaptation mechanisms first for `github/awesome-copilot`, `tt-a1i/archify`, `VoltAgent/awesome-agent-skills`, and `TencentCloud/TencentDB-Agent-Memory`.
4. Patch only the smallest ToolsForCodex integration that survives license/security/duplicate review.

## 12. Direct-Overlap License and Design Update

Observed at: 2026-09-02T10:00:35Z.

User request: license-read the 14 direct-overlap candidates, build the duplicate baseline, then start concrete import/adaptation design with `github/awesome-copilot`, `tt-a1i/archify`, `VoltAgent/awesome-agent-skills`, and `TencentCloud/TencentDB-Agent-Memory`.

Batch results:

- Re-cloned `ndj4312-collab/ToolsForCodex` from `main` at `7519dbd` into this session and scrubbed the credential-bearing clone URL back to a plain GitHub remote.
- Rehydrated the ignored quarantine set at `quarantine/starred-2026-09-02/` with the same 14 direct-overlap candidates listed in `docs/starred-repo-intake.md`.
- License-read all 14 root license surfaces and recorded states in `docs/direct-overlap-import-design.md`.
- Built the duplicate baseline from `skills-lock.json`, `skills/`, `approved-proposals/`, and `pointer-catalog/`: 84 installed skill records, 412 raw approved-proposal skill-like surfaces, 3 pointer-catalog skills, and 488 unique normalized baseline IDs.
- Found exact `github/awesome-copilot` collisions with already-harvested proposal skills: `code-tour`, `prompt-optimizer`, `setup`, and `security-review`.
- Started concrete import/adaptation design for the four priority repositories and recorded smallest safe boundaries.
- Target repo execution performed: none. No target install, build, test, package script, hook, notebook, binary, container, or service was run.
- Independent audit was attempted with a context-minimized sidecar reviewer, but the reviewer did not return within the useful window and was closed while still running. This remains a residual review gap before promotion beyond documentation/design.

Files changed this batch:

- `docs/direct-overlap-import-design.md`: license triage for the 14 candidates, duplicate baseline, and priority import/adaptation design.
- `context.md`: this section.

Queue decision snapshot:

- `github/awesome-copilot`: `IMPORT_CANDIDATE` for a static registry/validator adapter; defer individual resource imports until item-level duplicate/security review.
- `tt-a1i/archify`: `IMPORT_CANDIDATE` as proposal/pointer candidate for deterministic diagram artifacts; do not claim runtime verification until authorized target command execution occurs.
- `VoltAgent/awesome-agent-skills`: `NEEDS_MODIFICATION` as source-registry input; parse metadata/provenance, not bodies.
- `TencentCloud/TencentDB-Agent-Memory`: `NEEDS_MODIFICATION` as opt-in memory-provider adapter design; requires separate privacy/security design before implementation.

Next exact work:

1. Add fixture-backed ToolsForCodex contract/design for the `github/awesome-copilot` static registry adapter.
2. Validate that the adapter emits candidate records with kind, source path, license state, duplicate state, and no target code execution.
3. Run or obtain independent audit before any implementation/promotion beyond design documentation.
4. Commit, push, remote-read back, and update the ledger.

## 13. Starred Source Availability Registry Update

Observed at: 2026-09-02T18:05:00Z.

User request: review the GitHub starred list again and make sure the repository contents are available to ToolsForCodex, or at least that availability/import work has begun.

Batch results:

- Re-read the live authenticated GitHub starred list: 62 unique starred repositories.
- Re-ran the ToolsForCodex starred classifier against the live list: 62 classified records and the same 14 `DIRECT_TOOLSFORCODEX_OVERLAP` candidates.
- Compared live stars against the recorded intake/design docs. No live starred repository is missing from the recorded inventory. The apparent 76 recorded names were the 62 full inventory rows plus the repeated 14 direct-overlap design rows, not drift.
- Added `scripts/starred-availability.mjs`, a deterministic generator that converts classified GitHub-star metadata into a tracked source-locator availability registry.
- Generated `docs/starred-source-registry.json` and `docs/starred-source-registry.md` for all 62 live starred repositories.
- Availability is intentionally precise: the registry begins source-locator availability for ToolsForCodex, but it does not yet plug those records into the main source-record/catalog loader, vendor repository contents, run target code, or approve import.
- The registry carries the direct-overlap decisions from the license/design pass:
  - `github/awesome-copilot`: `IMPORT_CANDIDATE`, `ADAPTER_NEXT`.
  - `tt-a1i/archify`: `IMPORT_CANDIDATE`, `PROPOSAL_NEXT`.
  - `VoltAgent/awesome-agent-skills`: `NEEDS_MODIFICATION`, `SOURCE_REGISTRY_INPUT`.
  - `TencentCloud/TencentDB-Agent-Memory`: `NEEDS_MODIFICATION`, `DESIGNED_ADAPTER`.
- Added a unit test covering direct-overlap mapping, default source-locator mapping, markdown non-vendoring language, and the no-exec intake policy wording.
- Independent sidecar audit completed and found three issues: source-record overclaim, generated/input timestamp inconsistency, and hardcoded no-exec verification wording. All three were patched before commit.

Files changed this batch:

- `scripts/starred-availability.mjs`: source-locator availability registry generator.
- `test/unit/starred-availability.test.ts`: fixture-backed generator test.
- `docs/starred-source-registry.json`: machine-readable availability registry for all 62 live stars.
- `docs/starred-source-registry.md`: human-readable availability table for all 62 live stars.
- `package.json`: adds `starred:availability`.
- `docs/direct-overlap-import-design.md`: tightens credential-scan wording to avoid literal credential markers in tracked docs.
- `context.md`: this section.

Verification completed:

- `node --check scripts/starred-availability.mjs` passed.
- `node scripts/starred-availability.mjs --from-file .work/starred-intake/starred-classified-live.json --out docs/starred-source-registry.json --markdown docs/starred-source-registry.md --generated-at 2026-09-02T18:05:00.000Z` passed.
- Registry summary: 62 total, 14 direct overlap, 2 import candidates, 6 needs modification, 23 license-constrained.
- Registry shape assertion passed with `github/awesome-copilot` present as an `IMPORT_CANDIDATE`.
- Credential-marker scan over tracked files found no GitHub token prefixes, authenticated clone-url marker, or literal bearer-header marker entries.
- `git diff --check` passed.
- `npm run build` passed.
- `npm test -- --runInBand` passed: 6 suites, 15 tests.
- `npm run lint` passed.

Next exact work:

1. Add the first real loader/consumer for `docs/starred-source-registry.json` so source locators become first-class catalog records instead of documentation-only availability.
2. Start the `github/awesome-copilot` static registry/validator adapter against fixtures, with duplicate-state emission before any item import.
3. Add `tt-a1i/archify` proposal/pointer fixture design for deterministic diagram artifacts.
4. Keep `VoltAgent/awesome-agent-skills` and `TencentCloud/TencentDB-Agent-Memory` in modification-gated design until provenance/privacy constraints are encoded.
