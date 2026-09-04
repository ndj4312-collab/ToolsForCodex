# Starred Repo Intake

Generated from authenticated GitHub stars on 2026-09-02. This file records observed access and next integration work for ToolsForCodex. It does not contain tokens, auth headers, private clone URLs, or target repository payloads.

## Current Result

- Starred repositories read successfully through the authenticated GitHub API: 62.
- GitHub connector public repo reads also work for repository metadata/static files, but the connector surface does not expose authenticated `/user/starred`.
- Added `scripts/starred-repo-intake.mjs` so future sessions can reproduce the inventory with `GITHUB_TOKEN` or `GH_TOKEN`.
- Quarantine-pulled direct-overlap candidates: 14 shallow clones under ignored `quarantine/starred-2026-09-02/`.
- Target repo execution performed: none. No install, build, package script, test suite, notebook, hook, or container from any target repo was run.

## Reproduction

```bash
GITHUB_TOKEN=<token> npm run starred:intake -- --format json
GITHUB_TOKEN=<token> npm run starred:intake -- --format markdown
node scripts/starred-repo-intake.mjs --from-file stars.json --format json
```

The script classifies access/session usability only. Import value is determined later by static screen, license review, duplicate analysis, and an explicit ToolsForCodex integration design.

## Session Useability Classification

Every repo returned in this batch was public in API metadata and therefore:

- `cloud`: cloneable or static-readable when the session has network and any needed token.
- `local`: cloneable with ordinary `git clone`, plus token support for authenticated stars pagination.
- `remote-mcp`: public static repository files are readable by URL; authenticated star listing needs a token-aware adapter because the current connector surface is repository-oriented.
- `otherwise`: if a future private star appears, classify it as token-required and do not persist private metadata without explicit user approval.

## Direct ToolsForCodex Overlap Candidates

| Repository | License metadata | Static signals observed | Useability | Next integration action |
| --- | --- | --- | --- | --- |
| `TencentCloud/TencentDB-Agent-Memory` | `NOASSERTION`; license file exists, not yet reviewed | `MemoryCore/SKILL.md`, OpenClaw plugin JSON, SDK/docs, agent memory architecture | Cloud/local cloneable; remote public static-readable | Inspect license and extract memory primitives: chat memory, skill memory, LLM-wiki, code graph; design adapter only after duplicate/cost screen |
| `VoltAgent/awesome-agent-skills` | MIT | Compact curated skills index | Cloud/local cloneable; remote public static-readable | Parse linked skill sources into candidate registry; compare against existing `skills-lock.json` and approved proposals |
| `VoltAgent/awesome-claude-code-subagents` | MIT | `.claude-plugin`, `categories/`, `install-agents.sh` | Cloud/local cloneable; remote public static-readable | Inspect subagent schemas and installer statically; adapt reusable category/manifest structure without running installer |
| `VoltAgent/awesome-design-md` | MIT | Curated `DESIGN.md` examples | Cloud/local cloneable; remote public static-readable | Extract design-doc patterns for ToolsForCodex design/context templates; compare with current style contract |
| `ai-boost/awesome-prompts` | GPL-3.0 | Prompt catalog with prompt attack/protect focus | Cloud/local cloneable; remote public static-readable | License review before copying/adapting; extract only mechanisms or external locators until cleared |
| `alibaba/page-agent` | MIT | `AGENTS.md`, `CLAUDE.md`, `.agents/skills`, browser/extension packages, `prepare=husky` | Cloud/local cloneable; runtime should be sandbox/local only until reviewed | Static-screen agent skill and browser-control boundary; do not run package lifecycle scripts |
| `e2b-dev/awesome-ai-agents` | `NOASSERTION` | Large AI agent list | Cloud/local cloneable; remote public static-readable | Build agent ecosystem source list and dedupe against existing proposals before selecting concrete imports |
| `enescingoz/awesome-n8n-templates` | `NOASSERTION`; license file exists, not yet reviewed | Hundreds of n8n workflow JSON files, category docs, `llms.txt` | Cloud/local cloneable; remote public static-readable | License review, then extract automation trigger/frequency/failure patterns relevant to agent environment work |
| `github/awesome-copilot` | MIT | `agents/`, `skills/`, `instructions/`, `hooks/`, `workflows/`, schemas, validation scripts | Cloud/local cloneable; remote public static-readable | High-priority static import design: map GitHub skill/agent schemas to ToolsForCodex contracts and avoid duplicate skills |
| `hanishrao/collective-ai-tools` | MIT | `ai-manifest.json`, curated tool/search app, security/audit scripts | Cloud/local cloneable; remote public static-readable | Inspect manifest schema as possible source registry/search primitive for ToolsForCodex |
| `tashfeenahmed/freellmapi` | MIT | Multi-package API/router app, hooks, local/desktop/server docs | Cloud/local cloneable; runtime requires credential/security review | Treat as adapter candidate for model endpoint routing only after credential, abuse, and cost guardrails |
| `travisvn/awesome-claude-skills` | `NOASSERTION`; no license file observed in shallow root scan | Tiny Claude skills list | Cloud/local cloneable; remote public static-readable | Use as source-discovery list only until license/provenance is resolved |
| `tt-a1i/archify` | MIT | `archify/SKILL.md`, examples, generated receipts, visual-check output | Cloud/local cloneable; remote public static-readable | Strong candidate for architecture-diagram skill import/adaptation after static duplicate and test-fixture review |
| `zhaoxuya520/reverse-skill` | MIT | `skills/SKILL.md`, many security/reverse/CTF agents and scripts | Cloud/local cloneable; remote public static-readable; autonomous use needs safety limits | Keep behind explicit authorized-security/sandbox gate; inspect router structure but do not expose broadly |

## Full Star Inventory

| Repository | Band | License | Session use |
| --- | --- | --- | --- |
| `ChristosChristofidis/awesome-deep-learning` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `DataExpert-io/data-engineer-handbook` | secondary utility | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `DovAmir/awesome-design-patterns` | secondary utility | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `EmbraceAGI/awesome-chatgpt-zh` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `EthicalML/awesome-production-machine-learning` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `Kristories/awesome-guidelines` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `OffcierCia/DeFi-Developer-Road-Map` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `OpenCut-app/OpenCut` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `RunaCapital/awesome-oss-alternatives` | secondary utility | MIT | cloud/local cloneable; remote public static-readable |
| `Solido/awesome-flutter` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `TencentCloud/TencentDB-Agent-Memory` | direct overlap | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `TonnyL/Awesome_APIs` | secondary utility | CC-BY-SA-4.0 | cloud/local cloneable; remote public static-readable; archived static-only until reviewed |
| `VoltAgent/awesome-agent-skills` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `VoltAgent/awesome-claude-code-subagents` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `VoltAgent/awesome-design-md` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `aalhour/awesome-compilers` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `ai-boost/awesome-prompts` | direct overlap | GPL-3.0 | cloud/local cloneable; remote public static-readable |
| `ai-collection/ai-collection` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `aishwaryanr/awesome-generative-ai-guide` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `alibaba/page-agent` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `ashishps1/awesome-system-design-resources` | secondary utility | GPL-3.0 | cloud/local cloneable; remote public static-readable |
| `awesome-foss/awesome-sysadmin` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `awesome-selfhosted/awesome-selfhosted` | secondary utility | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `brillout/awesome-react-components` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `dastergon/awesome-sre` | secondary utility | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `dipakkr/A-to-Z-Resources-for-Students` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `dypsilon/frontend-dev-bookmarks` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `e2b-dev/awesome-ai-agents` | direct overlap | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `enaqx/awesome-react` | secondary utility | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `enescingoz/awesome-n8n-templates` | direct overlap | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `fffaraz/awesome-cpp` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `github/awesome-copilot` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `goabstract/Awesome-Design-Tools` | secondary utility | MIT | cloud/local cloneable; remote public static-readable |
| `hanishrao/collective-ai-tools` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `igorbarinov/awesome-data-engineering` | secondary utility | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `kuchin/awesome-cto` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `lnishan/awesome-competitive-programming` | secondary utility | CC-BY-4.0 | cloud/local cloneable; remote public static-readable |
| `matiassingers/awesome-readme` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `matteocrippa/awesome-swift` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `mezod/awesome-indie` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `piotrkulpinski/open-source-alternatives` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `prakhar1989/awesome-courses` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `public-api-lists/public-api-lists` | secondary utility | MIT | cloud/local cloneable; remote public static-readable |
| `public-apis/public-apis` | secondary utility | MIT | cloud/local cloneable; remote public static-readable |
| `rehooks/awesome-react-hooks` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `rushowr/Netryx-OpenSource-Next-Gen-Street-Level-Geolocation` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `sdras/awesome-actions` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `sindresorhus/awesome-nodejs` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `tashfeenahmed/freellmapi` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `terkelg/awesome-creative-coding` | secondary utility | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `thangchung/awesome-dotnet-core` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `thibmaek/awesome-raspberry-pi` | domain/learning | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `tiimgreen/github-cheat-sheet` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `travisvn/awesome-claude-skills` | direct overlap | `NOASSERTION` | cloud/local cloneable; remote public static-readable |
| `trimstray/the-book-of-secret-knowledge` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `tt-a1i/archify` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |
| `unixorn/awesome-zsh-plugins` | domain/learning | BSD-3-Clause | cloud/local cloneable; remote public static-readable |
| `viatsko/awesome-vscode` | domain/learning | CC0-1.0 | cloud/local cloneable; remote public static-readable |
| `vsouza/awesome-ios` | secondary utility | MIT | cloud/local cloneable; remote public static-readable |
| `wasabeef/awesome-android-ui` | domain/learning | MIT | cloud/local cloneable; remote public static-readable |
| `yusiqo/telegram-osint` | domain/learning | AGPL-3.0 | cloud/local cloneable; remote public static-readable |
| `zhaoxuya520/reverse-skill` | direct overlap | MIT | cloud/local cloneable; remote public static-readable |

## Immediate Next Batch

1. License-read the 14 direct-overlap candidates, prioritizing MIT/permissive candidates first.
2. Generate a duplicate baseline from `skills-lock.json`, `skills/`, `approved-proposals/`, and `pointer-catalog/`.
3. For `github/awesome-copilot`, `tt-a1i/archify`, `VoltAgent/awesome-agent-skills`, and `TencentCloud/TencentDB-Agent-Memory`, extract concrete mechanisms and smallest ToolsForCodex integration form.
4. Do not execute target repo code unless a later sandbox/runtime review explicitly authorizes it.
