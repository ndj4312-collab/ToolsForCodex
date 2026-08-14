---
name: production-orchestrator
description: Route repository work using the observed skills and workflows after review.
disable-model-invocation: true
---

# Repository coordinator

This coordinator was generated from the files present in the repository and approved for installation.

## How to use it

1. Read `INDEX.md` and `skills/INDEX.md` before selecting a component.
2. Choose the smallest skill whose observed description matches the user's request.
3. Follow that skill's own instructions and use the observed scripts and workflows only when they are relevant.
4. Pass the skill's output to the next step only when the output is present and validated.
5. Stop and ask for review when a needed file, dependency, permission, or expected output is missing.

## Observed skills

- /hcom-agent-messaging — > (unknown-invoked)

## Observed plugins

- .claude-plugin/marketplace.json
- plugin/hcom/.claude-plugin/plugin.json
- plugin/hcom/skills

## Observed workflows

- .github/workflows/build-wheels.yml
- .github/workflows/ci.yml
- .github/workflows/lint-workflows.yml
- .github/workflows/post-announce-compare-link.yml
- .github/workflows/publish-pypi.yml
- .github/workflows/release.yml

## Safety and limits

- Do not claim an inferred purpose is confirmed behavior.
- Do not run an observed script merely because it exists; confirm that it is needed and safe first.
- Do not install plugins, change global settings, or modify source files without explicit approval.
- Record missing metadata and unresolved connections as review items.

Evidence digest: `b78623dd5f0e5799e8c8ae7c73a857509acd7e84466d84f69c2bf5ea1ee4d740`
