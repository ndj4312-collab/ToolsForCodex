# Repository coordinator

This coordinator was generated from the files present in the repository and approved for installation.

## How to use it

1. Read `INDEX.md` and `skills/INDEX.md` before selecting a component.
2. Choose the smallest skill whose observed description matches the user's request.
3. Follow that skill's own instructions and use the observed scripts and workflows only when they are relevant.
4. Pass the skill's output to the next step only when the output is present and validated.
5. Stop and ask for review when a needed file, dependency, permission, or expected output is missing.

## Observed skills

- /brainstorming-extension — Enforces design review gate after brainstorming — bridges superpowers:brainstorming into the metaswarm quality pipeline (unknown-invoked)
- /create-issue — Create comprehensive GitHub issues with TDD plans, acceptance criteria, and agent instructions for autonomous PR lifecycle management (unknown-invoked)
- /design-review-gate — Automatic review gate that runs after brainstorming completes - spawns PM, Architect, Designer, Security, and CTO agents in parallel, iterates until all approve (unknown-invoked)
- /external-tools — Delegate implementation and review tasks to external AI CLI tools (Codex, Gemini) with cross-model adversarial review (unknown-invoked)
- /handling-pr-comments — Address PR review feedback systematically — fetch inline comments, review bodies, handle outside-diff-range comments, resolve threads with proper attribution (unknown-invoked)
- /handoff — Analyze the current session and write a self-contained handoff document so a fresh agent can resume the work with full context — outputs a single "Read XXX.md and do YYY." sentence (unknown-invoked)
- /migrate — Migrate from npm-installed metaswarm to the marketplace plugin — removes redundant files with safety checks (unknown-invoked)
- /orchestrated-execution — 4-phase execution loop for work units - IMPLEMENT, VALIDATE, ADVERSARIAL REVIEW, COMMIT (unknown-invoked)
- /plan-review-gate — Automatic adversarial review gate that spawns 3 independent reviewers in parallel after any plan is drafted - all must PASS before presenting to user (unknown-invoked)
- /pr-shepherd — Monitor a PR through to merge — handle CI failures, review comments, and thread resolution automatically until all checks pass (unknown-invoked)
- /setup — Interactive project setup — detects your project, configures metaswarm, writes project-local files (unknown-invoked)
- /start — Use when starting work on any task, when the user mentions metaswarm, or when the user wants to begin tracked development work (unknown-invoked)
- /status — Diagnostic status report — shows metaswarm installation state, project setup, and potential issues (unknown-invoked)
- /visual-review — Take screenshots of web pages and UI using Playwright for visual review and iteration (unknown-invoked)

## Observed plugins

- .agents/plugins/marketplace.json
- .claude-plugin/plugin.json
- .codex-plugin/plugin.json
- .cursor-plugin/README.md

## Observed workflows

- .github/workflows/ci.yml

## Safety and limits

- Do not claim an inferred purpose is confirmed behavior.
- Do not run an observed script merely because it exists; confirm that it is needed and safe first.
- Do not install plugins, change global settings, or modify source files without explicit approval.
- Record missing metadata and unresolved connections as review items.

Evidence digest: `123c0d9f4d9fb413460497aa8517523e21e6f9dd4984471686369fd23e9ebc90`
