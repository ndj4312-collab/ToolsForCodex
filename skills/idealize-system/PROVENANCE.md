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
- Small plan validator: **BUILD**. Existing repository contracts validate shape but do not detect semantic orphans, dangling dependency edges, cycles, evidence-free work, or non-executable IF/THEN branches. The bounded original implementation in `src/idealize/engine.ts` closes only that gap.

Runtime dependencies close locally: the four stage skills delegate only to repository-native control-plane and registry artifacts; the validator uses the Node runtime already required by the package and adds no dependency. External research surfaces are optional capabilities with fail-closed `UNKNOWN` behavior, not hidden install requirements.

Any future direct upstream code import must go through `docs/adding-repo-protocol.md`, resolve exact license and transitive dependencies, and update this record.
