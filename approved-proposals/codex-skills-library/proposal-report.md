# Proposal report

Status: **PROPOSED**

This report proposes a coordinator and file indexes from observed repository contents. Nothing was applied.

- Components: **66**
- Coordinator files: **2**
- Index and manifest files: **16**
- Source digest: `bbd69f94de1ca6dc88751e29a9a8c0532302826641f5ecbf58e2bf1bab77bbd5`
- Proposal digest: `1ee05bb08f760d5e3bc39aafeab44b831bccfb2ccdf7faf95cc566a16a0bf8ed`

## Proposed components

- **skill** `prompt-optimization` — `.codex/skills/prompt-optimization/SKILL.md` — Improve and rewrite user prompts to reduce ambiguity and improve LLM output quality. Use when a user asks to optimize, refine, clarify, or rewrite a prompt for better results, or when the request is about prompt optimization or prompt rewriting. (high confidence)
- **skill** `writing-assistant` — `.codex/skills/writing-assistant/SKILL.md` — Edits, rewrites, or improves text for clarity, tone, grammar, or style. (high confidence)
- **other** `.gitignore` — `.gitignore` — Observed repository asset (low confidence)
- **documentation** `CHANGELOG.md` — `docs/CHANGELOG.md` — Repository documentation (medium confidence)
- **documentation** `README.md` — `README.md` — Repository documentation (medium confidence)
- **skill** `api-contract-checker` — `skills/api/api-contract-checker/SKILL.md` — Validate API changes against an expected contract. Use when a mid-level developer needs to detect breaking changes. (high confidence)
- **skill** `api-error-taxonomy` — `skills/api/api-error-taxonomy/SKILL.md` — Define consistent API error codes and responses. Use when a mid-level developer needs error standardization. (high confidence)
- **skill** `api-request-builder` — `skills/api/api-request-builder/SKILL.md` — Build a basic HTTP request (curl or fetch) for an API. Use when a junior developer needs a quick request example. (high confidence)
- **skill** `buffer-api` — `skills/api/buffer-api/SKILL.md` — Manage Buffer content via the GraphQL API. Use when creating, scheduling, editing, or deleting posts, saving ideas, reading scheduled queues, or pulling post analytics. Not for general API debugging. (high confidence)
- **skill** `graphql-query-optimizer` — `skills/api/graphql-query-optimizer/SKILL.md` — Optimize GraphQL queries and resolvers for performance. Use when a mid-level developer needs to reduce N+1 or payload size. (high confidence)
- **skill** `architecture-review` — `skills/architecture/architecture-review/SKILL.md` — Review a system architecture for scalability, reliability, and maintainability. Use when a senior developer needs to critique a design. (high confidence)
- **skill** `domain-modeling` — `skills/architecture/domain-modeling/SKILL.md` — Model domains and bounded contexts for complex systems. Use when a senior developer needs domain-driven design guidance. (high confidence)
- **skill** `caching-strategy-helper` — `skills/backend/caching-strategy-helper/SKILL.md` — Recommend caching strategies and invalidation patterns. Use when a mid-level developer needs performance guidance. (high confidence)
- **skill** `feature-flag-playbook` — `skills/backend/feature-flag-playbook/SKILL.md` — Plan feature flag rollout and cleanup. Use when a mid-level developer needs controlled release guidance. (high confidence)
- **skill** `queue-processing-patterns` — `skills/backend/queue-processing-patterns/SKILL.md` — Design safe queue consumers and retries. Use when a mid-level developer needs reliable background processing. (high confidence)
- **skill** `system-design-draft` — `skills/backend/system-design-draft/SKILL.md` — Draft a practical system design for a feature. Use when a mid-level developer needs a starting architecture. (high confidence)
- **skill** `data-governance-check` — `skills/data/data-governance-check/SKILL.md` — Review data handling for privacy and retention. Use when a senior developer needs governance validation. (high confidence)
- **skill** `db-migration-reviewer` — `skills/data/db-migration-reviewer/SKILL.md` — Review database migrations for safety and rollback. Use when a mid-level developer needs validation of schema changes. (high confidence)
- **skill** `sql-query-starter` — `skills/data/sql-query-starter/SKILL.md` — Draft a basic SQL query from a simple requirement. Use when a junior developer needs help forming SELECT queries. (high confidence)
- **skill** `function-docstrings` — `skills/docs/function-docstrings/SKILL.md` — Write concise docstrings for functions. Use when a junior developer needs help describing inputs, outputs, and errors. (high confidence)
- **skill** `readme-polish` — `skills/docs/readme-polish/SKILL.md` — Improve a README for clarity and completeness. Use when a junior developer needs guidance on documenting setup and usage. (high confidence)
- **skill** `release-notes-drafter` — `skills/docs/release-notes-drafter/SKILL.md` — Draft release notes from changes and PRs. Use when a mid-level developer needs a structured changelog. (high confidence)
- **skill** `team-onboarding-guide` — `skills/docs/team-onboarding-guide/SKILL.md` — Create an onboarding guide for new engineers. Use when a senior developer needs structured onboarding materials. (high confidence)
- **skill** `codebase-orientation` — `skills/foundation/codebase-orientation/SKILL.md` — Guide quick orientation of an unfamiliar codebase with module mapping, entry points, and local run steps. Use when a junior developer needs to get situated fast. (high confidence)
- **skill** `config-file-explainer` — `skills/foundation/config-file-explainer/SKILL.md` — Explain a configuration file and its key options. Use when a junior developer is confused by a config file. (high confidence)
- **skill** `data-structure-chooser` — `skills/foundation/data-structure-chooser/SKILL.md` — Recommend basic data structures for a task. Use when a junior developer needs help choosing lists, maps, or sets. (high confidence)
- **skill** `debugging-checklist` — `skills/foundation/debugging-checklist/SKILL.md` — Provide a systematic debugging checklist. Use when a junior developer is stuck and needs a structured approach. (high confidence)
- **skill** `dependency-install-helper` — `skills/foundation/dependency-install-helper/SKILL.md` — Guide installation of project dependencies and toolchains. Use when a junior developer is stuck setting up the environment. (high confidence)
- **skill** `error-message-explainer` — `skills/foundation/error-message-explainer/SKILL.md` — Explain compiler/runtime errors in plain language. Use when a junior developer needs help understanding an error message. (high confidence)
- **skill** `git-basic-helper` — `skills/foundation/git-basic-helper/SKILL.md` — Provide safe git commands for common tasks. Use when a junior developer needs help with branching, commits, or resolving simple conflicts. (high confidence)
- **skill** `linter-fix-guide` — `skills/foundation/linter-fix-guide/SKILL.md` — Explain lint errors and propose fixes. Use when a junior developer needs help resolving common lint or format warnings. (high confidence)
- **skill** `log-summarizer` — `skills/foundation/log-summarizer/SKILL.md` — Summarize noisy logs into likely causes and next steps. Use when a junior developer needs help interpreting logs. (high confidence)
- **skill** `small-script-generator` — `skills/foundation/small-script-generator/SKILL.md` — Generate a small helper script for repetitive tasks. Use when a junior developer needs a quick automation snippet. (high confidence)
- **skill** `ticket-breakdown` — `skills/foundation/ticket-breakdown/SKILL.md` — Break a task or ticket into small steps. Use when a junior developer needs guidance on how to start. (high confidence)
- **skill** `accessibility-basic-check` — `skills/frontend/accessibility-basic-check/SKILL.md` — Run a basic accessibility checklist for UI changes. Use when a junior developer needs quick a11y guidance. (high confidence)
- **skill** `cli-ux-improver` — `skills/frontend/cli-ux-improver/SKILL.md` — Improve CLI help, errors, and output. Use when a mid-level developer needs to make a CLI friendlier. (high confidence)
- **skill** `css-layout-helper` — `skills/frontend/css-layout-helper/SKILL.md` — Explain CSS layout issues and propose fixes. Use when a junior developer is struggling with alignment or spacing. (high confidence)
- **skill** `ci-failure-triage` — `skills/infra/ci-failure-triage/SKILL.md` — Diagnose CI failures and stabilize pipelines. Use when a mid-level developer needs to resolve flaky or failing builds. (high confidence)
- **skill** `cross-service-debugger` — `skills/infra/cross-service-debugger/SKILL.md` — Coordinate debugging across multiple services. Use when a senior developer needs to trace a distributed issue. (high confidence)
- **skill** `iac-reviewer` — `skills/infra/iac-reviewer/SKILL.md` — Review infrastructure-as-code changes for safety and correctness. Use when a mid-level developer needs a second look on IaC. (high confidence)
- **skill** `multi-region-strategy` — `skills/infra/multi-region-strategy/SKILL.md` — Design a multi-region architecture strategy. Use when a senior developer needs geo-redundant planning. (high confidence)
- **skill** `observability-setup` — `skills/infra/observability-setup/SKILL.md` — Set up metrics, logs, and traces for a service. Use when a mid-level developer needs basic observability coverage. (high confidence)
- **skill** `platform-migration-plan` — `skills/infra/platform-migration-plan/SKILL.md` — Create a plan to migrate platforms or runtimes. Use when a senior developer needs a phased migration approach. (high confidence)
- **skill** `zero-downtime-migration` — `skills/infra/zero-downtime-migration/SKILL.md` — Plan a zero-downtime migration for data or infrastructure. Use when a senior developer needs a safe migration strategy. (high confidence)
- **skill** `cost-optimization-review` — `skills/performance/cost-optimization-review/SKILL.md` — Review system costs and propose reductions. Use when a senior developer needs cost-saving recommendations. (high confidence)
- **skill** `performance-budgeting` — `skills/performance/performance-budgeting/SKILL.md` — Define performance budgets and guardrails. Use when a senior developer needs performance targets and enforcement. (high confidence)
- **skill** `performance-trace-guide` — `skills/performance/performance-trace-guide/SKILL.md` — Guide collection and analysis of performance traces. Use when a mid-level developer needs to diagnose slowness. (high confidence)
- **skill** `scalability-assessment` — `skills/performance/scalability-assessment/SKILL.md` — Assess a system for growth bottlenecks. Use when a senior developer needs to evaluate scaling limits. (high confidence)
- **skill** `dependency-upgrade-plan` — `skills/planning/dependency-upgrade-plan/SKILL.md` — Plan safe dependency upgrades with risk notes. Use when a mid-level developer is tasked with upgrading libraries. (high confidence)
- **skill** `org-standardization` — `skills/planning/org-standardization/SKILL.md` — Define engineering standards across teams. Use when a senior developer needs to align practices. (high confidence)
- **skill** `pr-reviewer` — `skills/planning/pr-reviewer/SKILL.md` — Review a pull request for correctness, regressions, and missing tests. Use when a mid-level developer needs structured review guidance. (high confidence)
- **skill** `refactor-roadmap` — `skills/planning/refactor-roadmap/SKILL.md` — Create a staged refactor plan for a module. Use when a mid-level developer needs a safe refactor path. (high confidence)
- **skill** `roadmap-prioritization` — `skills/planning/roadmap-prioritization/SKILL.md` — Prioritize roadmap initiatives with tradeoffs. Use when a senior developer needs help ranking projects. (high confidence)
- **skill** `simple-refactor` — `skills/planning/simple-refactor/SKILL.md` — Suggest small refactors that improve readability without changing behavior. Use when a junior developer asks to clean up code. (high confidence)
- **skill** `tech-debt-portfolio` — `skills/planning/tech-debt-portfolio/SKILL.md` — Assess and prioritize tech debt items. Use when a senior developer needs an investment plan for debt reduction. (high confidence)
- **skill** `vendor-evaluation` — `skills/planning/vendor-evaluation/SKILL.md` — Evaluate third-party vendors for engineering fit. Use when a senior developer needs a structured vendor assessment. (high confidence)
- **skill** `incident-postmortem` — `skills/reliability/incident-postmortem/SKILL.md` — Draft an incident postmortem with timeline, RCA, and action items. Use when a senior developer needs a structured post-incident report. (high confidence)
- **skill** `reliability-slo-sla` — `skills/reliability/reliability-slo-sla/SKILL.md` — Define or review SLOs and SLAs for a service. Use when a senior developer needs reliability targets. (high confidence)
- **skill** `compliance-readiness` — `skills/security/compliance-readiness/SKILL.md` — Assess readiness for compliance audits. Use when a senior developer needs a gap analysis for standards. (high confidence)
- **skill** `config-hardening` — `skills/security/config-hardening/SKILL.md` — Harden configuration and defaults for safer deployment. Use when a mid-level developer needs to reduce misconfig risks. (high confidence)
- **skill** `dependency-risk-audit` — `skills/security/dependency-risk-audit/SKILL.md` — Audit dependencies for licensing, security, and maintenance risk. Use when a senior developer needs risk assessment. (high confidence)
- **skill** `security-quick-scan` — `skills/security/security-quick-scan/SKILL.md` — Scan code or configuration for common security issues. Use when a mid-level developer needs a quick security pass. (high confidence)
- **skill** `threat-modeling` — `skills/security/threat-modeling/SKILL.md` — Perform threat modeling for a system or feature. Use when a senior developer needs security risk assessment. (high confidence)
- **skill** `bug-repro-plan` — `skills/testing/bug-repro-plan/SKILL.md` — Create a minimal, repeatable reproduction plan for a bug. Use when a junior developer needs clear steps to reproduce and capture evidence. (high confidence)
- **skill** `integration-test-planner` — `skills/testing/integration-test-planner/SKILL.md` — Plan integration tests across modules or services. Use when a mid-level developer needs to verify system interactions. (high confidence)
- **skill** `unit-test-starter` — `skills/testing/unit-test-starter/SKILL.md` — Generate starter unit tests for a small function or module. Use when a junior developer needs test scaffolding and edge cases. (high confidence)

## Limitations

- Generated from observed paths and readable frontmatter; inferred purposes require human review.
- Existing skill metadata, dependencies, and instructions were not rewritten by this proposal.
- The proposal is stored under .orchestrator/proposals and has not been copied into the repository.
- The standardization plan is BLOCKED by 61 skill candidate(s) or dependency findings.
