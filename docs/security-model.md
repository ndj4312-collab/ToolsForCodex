# Security model

Audited files are untrusted data. Discovery never follows symlinks, runs scripts, contacts services, or installs tools. Configuration rejects absolute paths, parent traversal, shell-like fields, and write roots outside the target. Transactions bind operations to hashes, stage inside the target's orchestrator directory, require explicit approval, use replace-safe writes, and stop on drift or rollback conflicts.

Unknown facts are represented as `UNKNOWN` and block dependent work when they affect safety. Global user directories and provider synchronization are never touched implicitly.
