# Architecture

`src/` is executable canon. The CLI loads a relative configuration, preflights boundaries, discovers target assets without following symlinks or executing code, parses supported formats, classifies by ordered deterministic rules, builds a skill IR, validates dependencies, generates reviewable outputs, compiles runtime adapters, and manages hash-bound transactions.

The flow is `preflight -> audit/catalog -> plan -> bootstrap/adapters -> stage -> verify -> approve -> apply -> doctor/recheck`. Generated artifacts live below the configured output directory and are ignored by Git. `contracts/` owns interchange schemas; each skill owns its own `SKILL.md` and metadata.
