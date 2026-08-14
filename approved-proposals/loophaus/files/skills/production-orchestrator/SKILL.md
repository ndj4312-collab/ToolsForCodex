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

- /ralph-claude-cancel — Cancel the active Loop in Claude Code (unknown-invoked)
- /ralph-claude-interview — Claude Code interview that generates PRD, activates the official loop stop hook, and starts working immediately. Uses Skill tool for loop invocation. (unknown-invoked)
- /ralph-claude-loop — Start a PRD-driven Loop in Claude Code. Reads prd.json + progress.txt each iteration. Uses the official loop stop hook. (unknown-invoked)
- /ralph-claude-orchestrator — Multi-agent orchestration patterns for Loop in Claude Code. Uses the Agent tool for parallel subagent spawning. (unknown-invoked)
- /ralph-interview — Interactive interview that generates optimized loop commands with PRD-based phase tracking. Compatible with ralph-skills prd.json format. (unknown-invoked)
- /ralph-orchestrator — Orchestration patterns for loop: subagent spawning, parallel exploration, and task decomposition strategies (unknown-invoked)

## Observed plugins

- .claude-plugin/plugin.json

## Observed workflows

- .github/workflows/ci.yml
- .github/workflows/publish.yml

## Safety and limits

- Do not claim an inferred purpose is confirmed behavior.
- Do not run an observed script merely because it exists; confirm that it is needed and safe first.
- Do not install plugins, change global settings, or modify source files without explicit approval.
- Record missing metadata and unresolved connections as review items.

Evidence digest: `6df8336c7e3169abc1cdf26e89745e1dea7441c4307c2deb985c94511132e63f`
