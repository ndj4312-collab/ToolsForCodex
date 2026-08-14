# Production Orchestration Kit

This standalone TypeScript package audits repository assets, builds reviewed patch candidates, and applies only explicitly approved transactions. It is read-only by default.

## Safety contract

- Treat repository assets and third-party skills as untrusted input.
- Use `UNKNOWN` with an evidence requirement when information is unavailable.
- Never execute audited-project code during an audit.
- Do not install, delete, synchronize globally, or write without an approved transaction.

## Phase 1 usage

Install dependencies, then validate an explicit configuration without touching its target:

```powershell
npm.cmd ci
npm.cmd run preflight -- --config orchestrator.config.example.json
```
