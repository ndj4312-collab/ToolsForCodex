# Headroom Token Minimizer Intake

## Scope

Create a lightweight project skill and MCP adapter for Headroom-style context minimization. Do not vendor or execute external Headroom code in this batch.

## Provenance

- Candidate family: Headroom token/context minimization tools.
- Primary public repo observed during intake: `headroomlabs-ai/headroom`.
- Intake method: static source/provenance review only; no install, build, package execution, hooks, or runtime import.
- Repository payload status: not imported.

## Duplication boundary

Existing ToolsForCodex proposals mention token and cost optimization concepts. This batch adds a narrower production-facing skill: compress next-agent context and MCP/tool outputs while preserving audit evidence, claims, SHAs, paths, and verification outcomes.

## Promotion criteria

- Project skill appears in `skills/INDEX.md` and `skills/distribution-manifest.json`.
- Local and remote MCP wrappers expose `find_skills` and `load_skill`.
- Tests, build, and lint pass.
- Independent audit finds no blocker.
- Branch can be pushed and promoted to `main`.

## Non-goals

- No external Headroom dependency.
- No compression of secrets.
- No automatic lossy summarization for legal, security, code-review, or exact-diff work.
