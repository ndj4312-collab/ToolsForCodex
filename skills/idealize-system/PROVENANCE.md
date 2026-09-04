# IDEALIZE provenance and adaptation record

This package is an original ToolsForCodex composition. It does not vendor upstream skill bodies.

Primitive influences are methodological patterns already identified by the project's capability-search standard: adaptive interrogation (Grill/Grill-with-Docs family), domain modeling, recursive research, specification/ticket decomposition, TDD/review, orchestration, and repository intake/governance. Each is used as a behavior-level pattern or existing local capability rather than copied implementation.

Adaptation decisions:
- Existing recursive `find_skills` / `load_skill` registry: **USE**.
- Matt-style skill frontmatter + OpenAI metadata contract: **USE/SPECIALIZE**.
- Four stage-specific skill contracts: **SPECIALIZE**.
- Cross-stage route, source precedence, workaround and regression rules: **COMPOSE**.
- New MCP registration subsystem: **REJECT** as duplicate; recursive discovery already satisfies registration.
- Vendored upstream code: **REJECT**; no implementation dependency requires it.

Any future direct upstream code import must go through `docs/adding-repo-protocol.md`, resolve exact license and transitive dependencies, and update this record.
