# Review-only proposals

The `propose` command is the recovery path for repositories that contain useful skills or automation but do not yet have the coordinator and indexes required by this kit.

It reads the configured target using the same read-only discovery rules as `audit`. It identifies observed skills, plugins, workflows, agents, scripts, documentation, and configuration files. It then writes a proposal bundle below `.orchestrator/proposals/`:

- `proposal.json` — machine-readable components, evidence, confidence, limitations, and digest.
- `proposal-report.md` — human-readable summary.
- `files/` — the proposed `AGENTS.md`, coordinator skill, metadata, distribution manifest, and indexes.

The files under `files/` are candidates only. The command never copies them into the target and never runs target-project code. A later approved transaction may apply selected files after review, source-hash verification, and validation.

The generator preserves the target's observed skill root where possible, such as `skills/`, `.agents/skills/`, or `.codex/skills/`. It uses readable frontmatter for skill names, descriptions, and invocation mode; path-only inferences are marked with lower confidence.
