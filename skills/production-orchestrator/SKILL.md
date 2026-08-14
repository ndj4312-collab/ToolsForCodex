---
name: production-orchestrator
description: Run a reviewed repository orchestration transaction with explicit safety gates.
disable-model-invocation: true
---

# Production Orchestrator

Use this user-invoked skill to audit a repository and prepare a reviewed transaction. Start with `preflight` using an explicit configuration path.

## Operating modes

- **Audit:** Read and parse untrusted assets without executing audited-project code. Record missing facts as `UNKNOWN` and state the evidence required to resolve them.
- **Stage:** Produce a reviewed patch candidate and a transaction manifest. Preserve the source asset.
- **Apply:** Apply only a human-approved manifest after current hashes match its target files.

Never perform an implicit install, deletion, global synchronization, network request, or write. Stop when required evidence is unavailable.
