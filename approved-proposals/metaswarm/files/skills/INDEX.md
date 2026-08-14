# Proposed skills index

Generated from observed SKILL.md files. Review names and descriptions before applying.

Source digest: `123c0d9f4d9fb413460497aa8517523e21e6f9dd4984471686369fd23e9ebc90`

- `/brainstorming-extension` — `skills/brainstorming-extension/SKILL.md` — Enforces design review gate after brainstorming — bridges superpowers:brainstorming into the metaswarm quality pipeline
- `/create-issue` — `skills/create-issue/SKILL.md` — Create comprehensive GitHub issues with TDD plans, acceptance criteria, and agent instructions for autonomous PR lifecycle management
- `/design-review-gate` — `skills/design-review-gate/SKILL.md` — Automatic review gate that runs after brainstorming completes - spawns PM, Architect, Designer, Security, and CTO agents in parallel, iterates until all approve
- `/external-tools` — `skills/external-tools/SKILL.md` — Delegate implementation and review tasks to external AI CLI tools (Codex, Gemini) with cross-model adversarial review
- `/handling-pr-comments` — `skills/handling-pr-comments/SKILL.md` — Address PR review feedback systematically — fetch inline comments, review bodies, handle outside-diff-range comments, resolve threads with proper attribution
- `/handoff` — `skills/handoff/SKILL.md` — Analyze the current session and write a self-contained handoff document so a fresh agent can resume the work with full context — outputs a single "Read XXX.md and do YYY." sentence
- `/migrate` — `skills/migrate/SKILL.md` — Migrate from npm-installed metaswarm to the marketplace plugin — removes redundant files with safety checks
- `/orchestrated-execution` — `skills/orchestrated-execution/SKILL.md` — 4-phase execution loop for work units - IMPLEMENT, VALIDATE, ADVERSARIAL REVIEW, COMMIT
- `/plan-review-gate` — `skills/plan-review-gate/SKILL.md` — Automatic adversarial review gate that spawns 3 independent reviewers in parallel after any plan is drafted - all must PASS before presenting to user
- `/pr-shepherd` — `skills/pr-shepherd/SKILL.md` — Monitor a PR through to merge — handle CI failures, review comments, and thread resolution automatically until all checks pass
- `/setup` — `skills/setup/SKILL.md` — Interactive project setup — detects your project, configures metaswarm, writes project-local files
- `/start` — `skills/start/SKILL.md` — Use when starting work on any task, when the user mentions metaswarm, or when the user wants to begin tracked development work
- `/status` — `skills/status/SKILL.md` — Diagnostic status report — shows metaswarm installation state, project setup, and potential issues
- `/visual-review` — `skills/visual-review/SKILL.md` — Take screenshots of web pages and UI using Playwright for visual review and iteration
