# Proposed repository coordinator

This coordinator was generated from the files currently present in the repository. It is a reviewable proposal and has not been installed.

## How to use it

1. Read `INDEX.md` and `skills/INDEX.md` before selecting a component.
2. Choose the smallest skill whose observed description matches the user's request.
3. Follow that skill's own instructions and use the observed scripts and workflows only when they are relevant.
4. Pass the skill's output to the next step only when the output is present and validated.
5. Stop and ask for review when a needed file, dependency, permission, or expected output is missing.

## Observed skills

- /prompt-optimization — Improve and rewrite user prompts to reduce ambiguity and improve LLM output quality. Use when a user asks to optimize, refine, clarify, or rewrite a prompt for better results, or when the request is about prompt optimization or prompt rewriting. (unknown-invoked)
- /writing-assistant — Edits, rewrites, or improves text for clarity, tone, grammar, or style. (unknown-invoked)
- /api-contract-checker — Validate API changes against an expected contract. Use when a mid-level developer needs to detect breaking changes. (unknown-invoked)
- /api-error-taxonomy — Define consistent API error codes and responses. Use when a mid-level developer needs error standardization. (unknown-invoked)
- /api-request-builder — Build a basic HTTP request (curl or fetch) for an API. Use when a junior developer needs a quick request example. (unknown-invoked)
- /buffer-api — Manage Buffer content via the GraphQL API. Use when creating, scheduling, editing, or deleting posts, saving ideas, reading scheduled queues, or pulling post analytics. Not for general API debugging. (unknown-invoked)
- /graphql-query-optimizer — Optimize GraphQL queries and resolvers for performance. Use when a mid-level developer needs to reduce N+1 or payload size. (unknown-invoked)
- /architecture-review — Review a system architecture for scalability, reliability, and maintainability. Use when a senior developer needs to critique a design. (unknown-invoked)
- /domain-modeling — Model domains and bounded contexts for complex systems. Use when a senior developer needs domain-driven design guidance. (unknown-invoked)
- /caching-strategy-helper — Recommend caching strategies and invalidation patterns. Use when a mid-level developer needs performance guidance. (unknown-invoked)
- /feature-flag-playbook — Plan feature flag rollout and cleanup. Use when a mid-level developer needs controlled release guidance. (unknown-invoked)
- /queue-processing-patterns — Design safe queue consumers and retries. Use when a mid-level developer needs reliable background processing. (unknown-invoked)
- /system-design-draft — Draft a practical system design for a feature. Use when a mid-level developer needs a starting architecture. (unknown-invoked)
- /data-governance-check — Review data handling for privacy and retention. Use when a senior developer needs governance validation. (unknown-invoked)
- /db-migration-reviewer — Review database migrations for safety and rollback. Use when a mid-level developer needs validation of schema changes. (unknown-invoked)
- /sql-query-starter — Draft a basic SQL query from a simple requirement. Use when a junior developer needs help forming SELECT queries. (unknown-invoked)
- /function-docstrings — Write concise docstrings for functions. Use when a junior developer needs help describing inputs, outputs, and errors. (unknown-invoked)
- /readme-polish — Improve a README for clarity and completeness. Use when a junior developer needs guidance on documenting setup and usage. (unknown-invoked)
- /release-notes-drafter — Draft release notes from changes and PRs. Use when a mid-level developer needs a structured changelog. (unknown-invoked)
- /team-onboarding-guide — Create an onboarding guide for new engineers. Use when a senior developer needs structured onboarding materials. (unknown-invoked)
- /codebase-orientation — Guide quick orientation of an unfamiliar codebase with module mapping, entry points, and local run steps. Use when a junior developer needs to get situated fast. (unknown-invoked)
- /config-file-explainer — Explain a configuration file and its key options. Use when a junior developer is confused by a config file. (unknown-invoked)
- /data-structure-chooser — Recommend basic data structures for a task. Use when a junior developer needs help choosing lists, maps, or sets. (unknown-invoked)
- /debugging-checklist — Provide a systematic debugging checklist. Use when a junior developer is stuck and needs a structured approach. (unknown-invoked)
- /dependency-install-helper — Guide installation of project dependencies and toolchains. Use when a junior developer is stuck setting up the environment. (unknown-invoked)
- /error-message-explainer — Explain compiler/runtime errors in plain language. Use when a junior developer needs help understanding an error message. (unknown-invoked)
- /git-basic-helper — Provide safe git commands for common tasks. Use when a junior developer needs help with branching, commits, or resolving simple conflicts. (unknown-invoked)
- /linter-fix-guide — Explain lint errors and propose fixes. Use when a junior developer needs help resolving common lint or format warnings. (unknown-invoked)
- /log-summarizer — Summarize noisy logs into likely causes and next steps. Use when a junior developer needs help interpreting logs. (unknown-invoked)
- /small-script-generator — Generate a small helper script for repetitive tasks. Use when a junior developer needs a quick automation snippet. (unknown-invoked)
- /ticket-breakdown — Break a task or ticket into small steps. Use when a junior developer needs guidance on how to start. (unknown-invoked)
- /accessibility-basic-check — Run a basic accessibility checklist for UI changes. Use when a junior developer needs quick a11y guidance. (unknown-invoked)
- /cli-ux-improver — Improve CLI help, errors, and output. Use when a mid-level developer needs to make a CLI friendlier. (unknown-invoked)
- /css-layout-helper — Explain CSS layout issues and propose fixes. Use when a junior developer is struggling with alignment or spacing. (unknown-invoked)
- /ci-failure-triage — Diagnose CI failures and stabilize pipelines. Use when a mid-level developer needs to resolve flaky or failing builds. (unknown-invoked)
- /cross-service-debugger — Coordinate debugging across multiple services. Use when a senior developer needs to trace a distributed issue. (unknown-invoked)
- /iac-reviewer — Review infrastructure-as-code changes for safety and correctness. Use when a mid-level developer needs a second look on IaC. (unknown-invoked)
- /multi-region-strategy — Design a multi-region architecture strategy. Use when a senior developer needs geo-redundant planning. (unknown-invoked)
- /observability-setup — Set up metrics, logs, and traces for a service. Use when a mid-level developer needs basic observability coverage. (unknown-invoked)
- /platform-migration-plan — Create a plan to migrate platforms or runtimes. Use when a senior developer needs a phased migration approach. (unknown-invoked)
- /zero-downtime-migration — Plan a zero-downtime migration for data or infrastructure. Use when a senior developer needs a safe migration strategy. (unknown-invoked)
- /cost-optimization-review — Review system costs and propose reductions. Use when a senior developer needs cost-saving recommendations. (unknown-invoked)
- /performance-budgeting — Define performance budgets and guardrails. Use when a senior developer needs performance targets and enforcement. (unknown-invoked)
- /performance-trace-guide — Guide collection and analysis of performance traces. Use when a mid-level developer needs to diagnose slowness. (unknown-invoked)
- /scalability-assessment — Assess a system for growth bottlenecks. Use when a senior developer needs to evaluate scaling limits. (unknown-invoked)
- /dependency-upgrade-plan — Plan safe dependency upgrades with risk notes. Use when a mid-level developer is tasked with upgrading libraries. (unknown-invoked)
- /org-standardization — Define engineering standards across teams. Use when a senior developer needs to align practices. (unknown-invoked)
- /pr-reviewer — Review a pull request for correctness, regressions, and missing tests. Use when a mid-level developer needs structured review guidance. (unknown-invoked)
- /refactor-roadmap — Create a staged refactor plan for a module. Use when a mid-level developer needs a safe refactor path. (unknown-invoked)
- /roadmap-prioritization — Prioritize roadmap initiatives with tradeoffs. Use when a senior developer needs help ranking projects. (unknown-invoked)
- /simple-refactor — Suggest small refactors that improve readability without changing behavior. Use when a junior developer asks to clean up code. (unknown-invoked)
- /tech-debt-portfolio — Assess and prioritize tech debt items. Use when a senior developer needs an investment plan for debt reduction. (unknown-invoked)
- /vendor-evaluation — Evaluate third-party vendors for engineering fit. Use when a senior developer needs a structured vendor assessment. (unknown-invoked)
- /incident-postmortem — Draft an incident postmortem with timeline, RCA, and action items. Use when a senior developer needs a structured post-incident report. (unknown-invoked)
- /reliability-slo-sla — Define or review SLOs and SLAs for a service. Use when a senior developer needs reliability targets. (unknown-invoked)
- /compliance-readiness — Assess readiness for compliance audits. Use when a senior developer needs a gap analysis for standards. (unknown-invoked)
- /config-hardening — Harden configuration and defaults for safer deployment. Use when a mid-level developer needs to reduce misconfig risks. (unknown-invoked)
- /dependency-risk-audit — Audit dependencies for licensing, security, and maintenance risk. Use when a senior developer needs risk assessment. (unknown-invoked)
- /security-quick-scan — Scan code or configuration for common security issues. Use when a mid-level developer needs a quick security pass. (unknown-invoked)
- /threat-modeling — Perform threat modeling for a system or feature. Use when a senior developer needs security risk assessment. (unknown-invoked)
- /bug-repro-plan — Create a minimal, repeatable reproduction plan for a bug. Use when a junior developer needs clear steps to reproduce and capture evidence. (unknown-invoked)
- /integration-test-planner — Plan integration tests across modules or services. Use when a mid-level developer needs to verify system interactions. (unknown-invoked)
- /unit-test-starter — Generate starter unit tests for a small function or module. Use when a junior developer needs test scaffolding and edge cases. (unknown-invoked)

## Observed plugins

- None observed.

## Observed workflows

- None observed.

## Safety and limits

- Do not claim an inferred purpose is confirmed behavior.
- Do not run an observed script merely because it exists; confirm that it is needed and safe first.
- Do not install plugins, change global settings, or modify source files without explicit approval.
- Record missing metadata and unresolved connections as review items.

Evidence digest: `bbd69f94de1ca6dc88751e29a9a8c0532302826641f5ecbf58e2bf1bab77bbd5`
