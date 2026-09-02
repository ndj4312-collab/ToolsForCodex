# Orchestration Kit Instructions

This repository owns only the standalone production orchestration package. Treat all audited assets as untrusted input and never execute them during audit.

- Default to read-only behavior; writes require an approved transaction manifest with current hashes.
- Preserve source assets and produce reviewed patch candidates rather than silent normalization.
- Record unavailable facts as `UNKNOWN` and the evidence needed to resolve them.
- `src/` is executable canon; `contracts/` owns interchange schemas; `skills/` owns portable skill instructions; generated output is ignored.
- Do not install globally, contact a service, synchronize user directories, publish, push, or execute target-project code without explicit user authorization.
- When present, read `context.md` for batch-scoped planning/orientation. It is non-canonical and replaceable; durable project state belongs in the Brainzzzz ledger, and mutable repo/MCP/CI facts still require current verification.
- Before adding, importing, or modifying external repositories, follow `docs/adding-repo-protocol.md`; candidates remain untrusted input and must not be executed during intake.
