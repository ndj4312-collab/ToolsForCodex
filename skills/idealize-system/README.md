# IDEALIZE capability system

Invoke `/idealize <idea>`. The entry skill loads `control-plane.json` and `capability-registry.json`, reuses any current validated stage artifacts, and routes `/about → /investigate → /monolithize → /idealize`.

The human-facing result is `the-ideal-project-plan.md`. Its machine companion is `ideal-project-plan.json`, validated by `contracts/ideal-project-plan.schema.json` and `src/idealize/engine.ts`. A plan is blocked—not complete—when it has dependency cycles, orphan requirements/tasks, dangling edges, missing evidence, or non-executable conditional behavior.

Failures advance through the ordered workaround ladder. A repeated failure fingerprint cannot take the same retry again without new evidence. Only the affected dependency branch stops; independent work continues. Canonical-source conflicts remain `CONFLICTED` and block dependent claims.

Maintenance: change the schemas, control plane, registry, skills, tests, and provenance record together. Run lint, tests, build, release validation, package dry-run, real MCP `find_skills`/`load_skill`, and an independent adversarial review before promotion.
