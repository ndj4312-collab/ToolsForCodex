# Architecture

`src/` is executable canon. The CLI loads a relative configuration, preflights boundaries, discovers target assets without following symlinks or executing code, parses supported formats, classifies by ordered deterministic rules, builds a skill IR, validates dependencies, generates reviewable outputs, compiles runtime adapters, and manages hash-bound transactions.

The flow is `preflight -> audit/catalog -> plan -> propose -> bootstrap/adapters -> stage -> verify -> approve -> apply -> doctor/recheck`. Generated artifacts live below the configured output directory and are ignored by Git. `propose` is a review-only recovery stage: it can create coordinator, index, metadata, and manifest candidates even when `plan` is blocked, but it never installs them. `contracts/` owns interchange schemas; each skill owns its own `SKILL.md` and metadata.
