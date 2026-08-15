# Pointer catalog — index

Shared, cross-repo catalog of skills that have been pulled from this repo's
harvested source collections (`approved-proposals/`) into individual working
repos as thin "pointer skills." Any repo can read this before spawning a
discovery search — that's the whole point of it living here instead of inside
one project.

This index is deliberately tiny: it only lists *categories*, not individual
skills. Read this first, find the relevant category, then open only that
category's JSON file — don't read every category file to find one skill.

| Category | File | What it covers |
| --- | --- | --- |
| Config & context maintenance | `config-maintenance.json` | Cleaning up / auditing a repo's own Claude/Codex configuration |
| Team review & planning | `team-review.json` | Multi-perspective review of a proposal, feature, or decision |
| Cross-agent delegation | `cross-agent-delegation.json` | Handing implementation/review work to a different AI CLI (Codex, Gemini) |

## Ledger

`ledger.jsonl` records every past resolution across every consuming repo —
what use case was asked for, which skill answered it, and whether a search
was even needed. Check it before reading anything else here.

## Convention for consuming repos

A repo that installs a skill from this catalog should install it at
`.agents/skills/<id>/` (the shared, dual-harness location both Claude Code and
Codex CLI read), symlinked into `.claude/skills/<id>/` for Claude Code. See
any consuming repo's `find-skill` skill for the exact process.

## Adding a new category

Add a row above, plus a new `<category>.json` file with the same shape as the
existing ones. Don't add a fourth category for one skill — fold it into the
closest existing one until there are enough related skills to justify a
split.
