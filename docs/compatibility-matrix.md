# Compatibility matrix

| Runtime | User/model metadata | Portable instructions | Adapter output |
| --- | --- | --- | --- |
| Codex | preserved | supported | `.orchestrator/bootstrap/codex/` |
| Claude | preserved | supported | `.orchestrator/bootstrap/claude/` |
| Gemini | preserved | supported | `.orchestrator/bootstrap/gemini/` |
| Generic AGENTS | user/model distinction retained in IR; unsupported implicit invocation warned | supported | `.orchestrator/bootstrap/generic-agents/` |

The equivalence artifact compares skill names, invocation modes, dependencies, instruction digests, and security boundaries. Adapter-only capability warnings do not silently change semantics.
