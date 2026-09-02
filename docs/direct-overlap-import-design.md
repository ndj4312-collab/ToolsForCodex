# Direct-Overlap Import Design

Observed at: 2026-09-02T10:00:35Z.

This record continues the starred-repository intake without executing target repository code. The 14 direct-overlap candidates were shallow-cloned into ignored `quarantine/starred-2026-09-02/` for static inspection only.

## Quality Gate

- `QUESTION`: Which direct-overlap starred repositories survive license triage, duplicate baseline comparison, and concrete ToolsForCodex import/adaptation design?
- `UTILITY`: Prevent duplicated or license-confused skill imports while preserving usable mechanisms from starred repositories.
- `EVIDENCE`: Root license files, candidate root/static files, `skills-lock.json`, `skills/`, `approved-proposals/`, and `pointer-catalog/`.
- `FAILURE`: A repo can look useful while only duplicating an existing skill, requiring unsafe runtime execution, or carrying license terms that block copying.
- `ACCEPTANCE`: Each of the 14 has a license state, the duplicate baseline is explicit, and the four priority repos have a smallest safe integration boundary.

## License Triage

| Candidate | Static license evidence | License state | Import effect |
| --- | --- | --- | --- |
| `TencentCloud/TencentDB-Agent-Memory` | Root `LICENSE` says TencentDB Agent Memory is licensed under MIT. GitHub metadata was `NOASSERTION`. | `LICENSE_OK_FOR_ADAPTATION` | MIT-cleared for adapted design/code, but runtime/security cost still blocks wholesale import. |
| `VoltAgent/awesome-agent-skills` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | Safe as registry/source-list input with attribution. |
| `VoltAgent/awesome-claude-code-subagents` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | Safe to study manifest/category structure; installer remains no-exec during intake. |
| `VoltAgent/awesome-design-md` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | Safe to extract design-doc patterns after duplicate/style review. |
| `ai-boost/awesome-prompts` | Root `LICENSE`, GPL-3.0. | `LICENSE_NEEDS_REVIEW` | Do not copy or adapt prompt text into ToolsForCodex. Mechanism-only notes or external locators are acceptable. |
| `alibaba/page-agent` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | MIT-cleared, but package lifecycle scripts, `.husky`, browser/extension packages require static-only review before any runtime use. |
| `e2b-dev/awesome-ai-agents` | Root `LICENSE.md`, Creative Commons Attribution-NonCommercial-ShareAlike 4.0. | `LICENSE_BLOCKED_FOR_IMPORT` | No vendoring/adaptation into ToolsForCodex without explicit legal review; source-discovery/reference only. |
| `enescingoz/awesome-n8n-templates` | Root `LICENSE`, Creative Commons Attribution 4.0. | `LICENSE_OK_FOR_REFERENCE`; `LICENSE_NEEDS_ATTRIBUTION_FOR_ADAPTATION` | Use for trigger/failure-pattern extraction with attribution; do not bulk-copy workflows without a separate provenance record. |
| `github/awesome-copilot` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | Safe to adapt schemas/registry ideas and selectively import cleared resources after duplicate/security gates. |
| `hanishrao/collective-ai-tools` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | Safe to inspect manifest/search primitive later. |
| `tashfeenahmed/freellmapi` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | Runtime/credential risk blocks import until a separate adapter/security design exists. |
| `travisvn/awesome-claude-skills` | No root license file observed in shallow clone. | `LICENSE_UNKNOWN` | Block copy/adaptation; source-discovery only until permission is resolved. |
| `tt-a1i/archify` | Root `LICENSE`, MIT; `THIRD_PARTY_NOTICES.md` present. | `LICENSE_OK_FOR_ADAPTATION` | Strong adapter/test-fixture candidate; keep third-party notices with any vendored subset. |
| `zhaoxuya520/reverse-skill` | Root `LICENSE`, MIT. | `LICENSE_OK_FOR_ADAPTATION` | Safety-sensitive; keep behind explicit authorized-security and sandbox gates. |

## Duplicate Baseline

Baseline inputs:

| Surface | Observed count | Meaning |
| --- | ---: | --- |
| `skills-lock.json` | 84 installed skill records | Current installed/locked surface; 49 from `coreyhaines31/marketingskills`, 35 from `mattpocock/skills`. |
| `skills/` | 3 local skill packages plus indexes/agent YAML | Current first-party/installed local skill files. |
| `approved-proposals/` | 412 raw skill-like proposal surfaces | Harvested but not necessarily installed. |
| `pointer-catalog/` | 3 pointer-catalog skills | Thin cross-repo pointers for config cleanup, team review, and cross-agent delegation. |
| Unique normalized baseline | 488 skill/pointer IDs | Deduplicated comparison set used for import screening. |

Exact name collisions found so far:

| Candidate source | Candidate item | Baseline collision | Collision surface |
| --- | --- | --- | --- |
| `github/awesome-copilot` | `code-tour` | `code-tour` | `approved-proposals/everything-claude-code/files/skills/code-tour/INDEX.md` |
| `github/awesome-copilot` | `prompt-optimizer` | `prompt-optimizer` | `approved-proposals/everything-claude-code/files/skills/prompt-optimizer/INDEX.md` |
| `github/awesome-copilot` | `setup` | `setup` | `approved-proposals/metaswarm/files/skills/setup/INDEX.md` |
| `github/awesome-copilot` | `security-review` | `security-review` | `approved-proposals/everything-claude-code/files/skills/security-review/INDEX.md` |

Important near-overlap families:

| Candidate mechanism | Existing overlap family | Baseline locators | Import consequence |
| --- | --- | --- | --- |
| Agent/team orchestration | `dev-team`, `agent-orchestration-advisor`, `team-agent-orchestration`, `external-tools` | `approved-proposals/Product-Manager-Skills`, `approved-proposals/everything-claude-code`, `pointer-catalog/cross-agent-delegation.json` | Import only if invocation schema, failure behavior, or runtime boundary is materially different. |
| Architecture visualization | `architecture`, `agent-architecture-audit`, `design-system` | `approved-proposals/codex-skills-library`, `approved-proposals/everything-claude-code` | Archify is not a duplicate if treated as a deterministic diagram artifact renderer with schemas/receipts. |
| Memory/knowledge operations | `unified-memory`, `knowledge-ops`, `context-budget`, `context-engineering-advisor` | `approved-proposals/everything-claude-code`, `approved-proposals/Product-Manager-Skills` | Tencent memory should become an optional adapter design, not a default persistent memory layer. |
| Security/review gates | `code-review`, `security-review`, `grill-with-docs`, `mcp-implementation-security-review` | `skills/engineering`, `approved-proposals/everything-claude-code`, `github/awesome-copilot` | Dedupe before any security-skill import; prefer one router/registry entry over another broad skill. |

## Priority Import/Adaptation Design

### `github/awesome-copilot`

- Mechanism: multi-kind collection of agents, instructions, skills, hooks, workflows, plugins, marketplace metadata, JSON schemas, and validation scripts.
- Useful primitive: a multi-kind external customization registry and validator mapping `agent`, `instruction`, `skill`, `hook`, `workflow`, and `plugin` into ToolsForCodex source records.
- Duplicate result: high overlap in individual skills; exact collisions already exist for `code-tour`, `prompt-optimizer`, `setup`, and `security-review`.
- Smallest safe integration: add a ToolsForCodex intake adapter that reads static `awesome-copilot` manifests/paths and emits candidate records against existing contracts. Do not bulk-copy resources.
- Queue state: `IMPORT_CANDIDATE` for registry/validator adapter; `DEFER` for individual resource imports until item-level duplicate/security review.
- Acceptance test: fixture using static paths from the quarantine clone produces normalized records with kind, source path, license state, duplicate state, and no target code execution.

### `tt-a1i/archify`

- Mechanism: MIT skill package for typed architecture/workflow/sequence/dataflow/lifecycle diagram specs, schemas, deterministic validation, delivery receipts, and browser evidence.
- Useful primitive: schema-first visual artifact generation with validation receipts and strict evidence separation.
- Duplicate result: overlaps conceptually with baseline `architecture`, `agent-architecture-audit`, and `design-system`; fundamental difference is deterministic renderer/receipt behavior rather than advisory architecture prose.
- Smallest safe integration: import/adapt as a quarantined proposal or pointer skill first, preserving MIT attribution and `THIRD_PARTY_NOTICES.md`; optionally add sample fixture validation later only after target command execution is separately authorized.
- Queue state: `IMPORT_CANDIDATE`.
- Acceptance test: ToolsForCodex proposal record references the skill, schemas, examples, license, notices, runtime requirement, and no-exec boundary; no claim that Archify works in ToolsForCodex until its own validation command is run in an authorized sandbox.

### `VoltAgent/awesome-agent-skills`

- Mechanism: curated index of 1000+ agent skills, organized by maintainer/team and linked source.
- Useful primitive: source discovery and candidate registry seeding with maintainer/category/provenance metadata.
- Duplicate result: broad overlap with `approved-proposals/`; value is not a new skill, it is a curated source list that can improve discovery and dedupe.
- Smallest safe integration: add as `RESEARCH_PROMISING_NOT_SKILL_READY` source registry input; parse only linked metadata into intake candidates, then compare each linked skill against the 488-ID duplicate baseline.
- Queue state: `NEEDS_MODIFICATION`.
- Acceptance test: a future parser extracts owner/source URL/category/name/description/license-if-observed without copying skill bodies.

### `TencentCloud/TencentDB-Agent-Memory`

- Mechanism: local HTTP gateway and adapters for L0 conversations, L1 atomic memories, L2 scenarios, L3 profiles, skill memory, knowledge metadata, asset metadata, and Codex/OpenClaw/Hermes integration.
- Useful primitive: optional memory adapter contract: capture completed turns, recall bounded L1/L2/L3 context before prompt construction, and inject labeled memory into an agent runtime.
- Duplicate result: overlaps with existing harvested `unified-memory`, `knowledge-ops`, `context-budget`, and `context-engineering-advisor`; unique value is concrete HTTP/SDK boundary and Codex Responses API proxy notes.
- Smallest safe integration: design a ToolsForCodex `memory-provider` contract and Tencent adapter proposal without running MemoryCore, installing plugins, binding ports, or persisting user memory through it.
- Queue state: `NEEDS_MODIFICATION`.
- Acceptance test: adapter design defines inputs, outputs, auth boundary, storage boundary, token budget, failure mode, and opt-in trigger; no default capture and no secret persistence.

## Current Decision

Proceed with design-only integration records for the four priority repos. The next implementation batch should start with fixtures and contract changes for the `awesome-copilot` registry adapter because it has the best license posture, lowest runtime risk, and direct leverage over future duplicate analysis. Archify can follow as a proposal/pointer candidate. Tencent memory requires a separate privacy/security design before implementation.

## Verification

- `git diff --check` passed.
- Credential-marker scan over tracked files found no `ghp_`, `github_pat_`, `x-access-token`, or literal `Authorization: Bearer` entries.
- Quarantine clone count verified at 14.
- `npm ci --ignore-scripts` completed successfully.
- `npm run build` passed.
- `npm test -- --runInBand` passed: 5 suites, 14 tests.
- `npm run lint` passed.
- Independent audit was attempted with a context-minimized sidecar reviewer, but the reviewer did not return within the useful window and was closed while still running. Treat this as a residual review gap before promotion beyond documentation/design.
