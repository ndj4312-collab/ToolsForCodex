---
name: production-orchestrator
description: Route repository work using the observed skills and workflows after review.
disable-model-invocation: true
---

# Proposed repository coordinator

This coordinator was generated from the files currently present in the repository. It is a reviewable proposal and has not been installed.

## How to use it

1. Read `INDEX.md` and `skills/INDEX.md` before selecting a component.
2. Choose the smallest skill whose observed description matches the user's request.
3. Follow that skill's own instructions and use the observed scripts and workflows only when they are relevant.
4. Pass the skill's output to the next step only when the output is present and validated.
5. Stop and ask for review when a needed file, dependency, permission, or expected output is missing.

## Observed skills

- /api-designer — Design RESTful APIs with best practices for consistency and usability (unknown-invoked)
- /coding-assistant — Provides coding assistance with best practices and code review (unknown-invoked)
- /debug-helper — Systematic debugging approach for identifying and fixing issues (unknown-invoked)
- /git-workflow — Git best practices for version control and collaboration (unknown-invoked)
- /test-writer — Write thorough tests following TDD and BDD principles (unknown-invoked)
- /html-portal-generator — Convert a codebase into a self-contained HTML portal app for ingestion into AI application systems. Produces a single deployable HTML file with embedded CSS, JS, and data. (unknown-invoked)

## Observed plugins

- .claude-plugin/marketplace.json
- plugins/skrills/.claude-plugin/plugin.json
- plugins/skrills/commands/analyze-skills.md
- plugins/skrills/commands/create-skill.md
- plugins/skrills/commands/search-skills.md
- plugins/skrills/commands/skill-diff.md
- plugins/skrills/commands/skill-metrics.md
- plugins/skrills/commands/skill-trace-disable.md
- plugins/skrills/commands/skill-trace-enable.md
- plugins/skrills/commands/skill-trace-status.md
- plugins/skrills/commands/suggest-skills.md
- plugins/skrills/commands/sync-all.md
- plugins/skrills/commands/sync-from-claude.md
- plugins/skrills/commands/sync-from-copilot.md
- plugins/skrills/commands/sync-from-cursor.md
- plugins/skrills/commands/sync-status.md
- plugins/skrills/commands/sync-to-copilot.md
- plugins/skrills/commands/sync-to-cursor.md
- plugins/skrills/commands/validate-skills.md

## Observed workflows

- .github/actions/validate-skills/action.yml
- .github/actions/validate-skills/entrypoint.sh
- .github/workflows/audit.yml
- .github/workflows/book-pages.yml
- .github/workflows/ci.yml
- .github/workflows/coverage.yml
- .github/workflows/dependency-monitor.yml
- .github/workflows/integration-tests.yml
- .github/workflows/publish-dry-run.yml
- .github/workflows/release.yml
- .github/workflows/validate-skills-example.yml

## Safety and limits

- Do not claim an inferred purpose is confirmed behavior.
- Do not run an observed script merely because it exists; confirm that it is needed and safe first.
- Do not install plugins, change global settings, or modify source files without explicit approval.
- Record missing metadata and unresolved connections as review items.

Evidence digest: `efbf480a59b84d62b2a424b18f5c5486ed410a7afbed3d7cbba7cd2309c012a7`
