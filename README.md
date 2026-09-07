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

## MCP server

The orchestrator is also available as an MCP server, exposing every CLI command (`preflight`, `audit`, `catalog`, `plan`, `propose`, `bootstrap`, `verify-adapters`, `doctor`, `stage`, `verify`, `approve`, `apply`, `rollback`) as an MCP tool with the same safety gates as the CLI. It is a protocol adapter, not a new code path — `src/mcp/server.ts` calls the identical functions `src/cli.ts` does.

Add it to Claude Code:

```
claude mcp add toolsforcodex -- npx -y --package=github:ndj4312-collab/toolsforcodex toolsforcodex-mcp
```

Or to Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "toolsforcodex": {
      "command": "npx",
      "args": ["-y", "--package=github:ndj4312-collab/toolsforcodex", "toolsforcodex-mcp"]
    }
  }
}
```

Every tool call takes a `configPath` (and `transaction`/`approval` where the underlying CLI command requires one) pointing at an `orchestrator.config.example.json`-shaped file for the target project.

### Remote (hosted) MCP server — for claude.ai / mobile

`src/mcp/server.ts` above only works for local clients that can spawn a subprocess (Claude Code, Claude Desktop's local config). claude.ai, Cowork, and the mobile apps connect to Custom Connectors instead, which must be a remote HTTPS server — there's no local disk of "your project" to point at from Anthropic's cloud infrastructure.

`src/mcp/remote/server.ts` solves that with a clone-per-session model, fit for sporadic, single-session use: call `set_target` once with a git URL to shallow-clone it into a temp directory for that session, then every other tool call runs against that clone until the session ends (idle timeout or client disconnect), at which point the clone is deleted. Nothing persists between sessions.

Deploy free on Render (`render.yaml` is included as a Blueprint):
1. render.com → **New → Blueprint** → connect this repo → Apply
2. Once live, add it in Claude: **Settings → Connectors → Add custom connector**, paste `https://<your-service>.onrender.com/mcp`

Free-tier notes: cold start after ~15 min idle (fine for sporadic use, adds a few seconds to the first call of a session); `set_target` requires `git` to be present in the runtime image, which Render's default Node image includes.

## Canonical ownership

- `src/` owns executable orchestration behavior.
- `contracts/` owns JSON interchange schemas.
- `skills/*/SKILL.md` owns portable instructions and `agents/openai.yaml` owns generated-facing metadata.
- `docs/` explains architecture and compatibility without duplicating runtime canon.
- `.orchestrator/` is generated and ignored.
