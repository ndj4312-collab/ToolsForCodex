# Production Orchestration Kit

This standalone TypeScript package audits repository assets, builds reviewed patch candidates, and applies only explicitly approved transactions. It is read-only by default.

## Safety contract

- Treat repository assets and third-party skills as untrusted input.
- Use `UNKNOWN` with an evidence requirement when information is unavailable.
- Never execute audited-project code during an audit.
- Do not install, delete, synchronize globally, or write without an approved transaction.

## Workflow

Install dependencies, then run the stages in order:

```powershell
npm.cmd ci
npm.cmd run preflight -- --config orchestrator.config.example.json
npm.cmd run audit -- --config orchestrator.config.example.json
npm.cmd run plan -- --config orchestrator.config.example.json
npm.cmd run propose -- --config orchestrator.config.example.json
npm.cmd run bootstrap -- --config orchestrator.config.example.json
npm.cmd run doctor -- --config orchestrator.config.example.json
```

`audit` and `catalog` are read-only with generated output isolated below `.orchestrator/`. `plan` preserves source files and emits reviewable candidates. `propose` creates review-only coordinator, index, metadata, and manifest candidates under `.orchestrator/proposals/`, even when the plan is blocked; it never copies them into the target. `bootstrap` requires a non-blocked plan and exactly one distribution route. A target write requires `stage`, `verify`, a matching human approval file, and then `apply`; `rollback` is hash-guarded.

## Canonical ownership

- `src/` owns executable orchestration behavior.
- `contracts/` owns JSON interchange schemas.
- `skills/*/SKILL.md` owns portable instructions and `agents/openai.yaml` owns generated-facing metadata.
- `docs/` explains architecture and compatibility without duplicating runtime canon.
- `.orchestrator/` is generated and ignored.
