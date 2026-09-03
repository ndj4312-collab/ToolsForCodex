#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { z } from "zod";
import { preflight, PreflightError } from "../../config/load";
import type { OrchestratorConfig } from "../../config/types";
import { buildCatalog, writeCatalogOutputs } from "../../discovery/catalog";
import { writeStandardizationOutputs } from "../../normalization/skill-normalizer";
import { generateBootstrap } from "../../bootstrap/generate";
import {
  approveTransaction,
  applyTransaction,
  rollbackTransaction,
  stageTransaction,
  verifyTransaction,
} from "../../transactions/engine";
import { validateProject } from "../../validation/project";
import { writeProposalOutputs } from "../../proposals/generate";
import { findProjectSkills, loadProjectSkill } from "../skill-registry";
import { cleanupSession, resolveConfigPath, setTarget } from "./session-store";

/**
 * Remote (Streamable HTTP) MCP server, for hosting somewhere with a public
 * URL (Render, etc.) so claude.ai / mobile can add it as a custom connector.
 *
 * Unlike the local stdio server (src/mcp/server.ts), there is no local disk
 * of "your own project" to point at here. Every session starts by calling
 * `set_target` with a git URL; that gets shallow-cloned once for the
 * session and every other tool call operates against that clone. See
 * src/mcp/remote/session-store.ts for the clone/cleanup lifecycle.
 */

const REMOTE_TOOL_NAMES = [
  "set_target",
  "preflight",
  "audit",
  "catalog",
  "plan",
  "propose",
  "bootstrap",
  "verify_adapters",
  "doctor",
  "find_skills",
  "load_skill",
  "stage",
  "verify",
  "approve",
  "apply",
  "rollback",
] as const;

function healthPayload() {
  return {
    status: "ok",
    server: "toolsforcodex-remote",
    version: "0.2.0",
    commit: process.env.RENDER_GIT_COMMIT ?? process.env.GIT_COMMIT ?? "UNKNOWN",
    branch: process.env.RENDER_GIT_BRANCH ?? process.env.GIT_BRANCH ?? "UNKNOWN",
    service: process.env.RENDER_SERVICE_NAME ?? "UNKNOWN",
    tools: REMOTE_TOOL_NAMES,
  };
}

function loadTarget(configPath: string): { config: OrchestratorConfig; targetRoot: string } {
  const result = preflight(configPath);
  const config = JSON.parse(readFileSync(resolve(configPath), "utf8")) as OrchestratorConfig;
  return { config, targetRoot: result.targetRoot };
}

type ToolResult = { content: Array<{ type: "text"; text: string }>; isError?: boolean };

function ok(result: unknown): ToolResult {
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

function fail(error: unknown): ToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}

async function guarded(fn: () => unknown | Promise<unknown>): Promise<ToolResult> {
  try {
    return ok(await fn());
  } catch (error) {
    return fail(error);
  }
}

function runBootstrap(configPath: string) {
  const { config, targetRoot } = loadTarget(configPath);
  const plan = writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode);
  if (plan.status === "BLOCKED") throw new PreflightError("Bootstrap blocked by standardization findings");
  return generateBootstrap(targetRoot, config, plan.candidates.map((candidate) => candidate.skill));
}

const optionalConfigPath = z.string().optional().describe("Advanced: explicit config path override. Normally omit this and use the session's set_target instead.");

function buildOrchestratorServer(sessionIdRef: { current: string | undefined }): McpServer {
  const server = new McpServer({ name: "toolsforcodex-remote", version: "0.2.0" });
  const cfg = (explicit: string | undefined) => resolveConfigPath(explicit, sessionIdRef.current);

  server.registerTool(
    "set_target",
    {
      title: "Set target repository",
      description: "Shallow-clone a git repo for this session. Call this once before any other tool. Every later tool call in this session runs against this clone until you call set_target again.",
      inputSchema: {
        repoUrl: z.string().describe("Git URL to clone, e.g. https://github.com/owner/repo.git"),
        ref: z.string().optional().describe("Branch, tag, or commit to check out. Defaults to the repo's default branch."),
      },
    },
    async ({ repoUrl, ref }) => guarded(() => {
      if (!sessionIdRef.current) throw new Error("No MCP session id available; the server must be running in stateful mode.");
      return setTarget(sessionIdRef.current, repoUrl, ref);
    }),
  );

  server.registerTool(
    "preflight",
    { title: "Preflight", description: "Validate the current session target. Read-only.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) => guarded(() => preflight(cfg(configPath))),
  );

  server.registerTool(
    "audit",
    { title: "Audit", description: "Read-only repository audit of the session target.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) =>
      guarded(() => {
        const { config, targetRoot } = loadTarget(cfg(configPath));
        const before = buildCatalog(targetRoot, config);
        const catalog = writeCatalogOutputs(targetRoot, config);
        const after = buildCatalog(targetRoot, config);
        if (before.overallDigest !== after.overallDigest) throw new PreflightError("Read-only audit changed the target tree");
        return { ...catalog, readOnlyCheck: "VERIFIED" };
      }),
  );

  server.registerTool(
    "catalog",
    { title: "Catalog", description: "Build and write the discovery catalog for the session target.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) => guarded(() => { const { config, targetRoot } = loadTarget(cfg(configPath)); return writeCatalogOutputs(targetRoot, config); }),
  );

  server.registerTool(
    "plan",
    { title: "Plan", description: "Build a standardization plan for the session target.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) =>
      guarded(() => { const { config, targetRoot } = loadTarget(cfg(configPath)); return writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode); }),
  );

  server.registerTool(
    "propose",
    { title: "Propose", description: "Create review-only proposal candidates for the session target.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) =>
      guarded(() => {
        const path = cfg(configPath);
        const { config, targetRoot } = loadTarget(path);
        const catalog = writeCatalogOutputs(targetRoot, config);
        const plan = writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode);
        return writeProposalOutputs(targetRoot, config, catalog, plan);
      }),
  );

  server.registerTool(
    "bootstrap",
    { title: "Bootstrap", description: "Requires a non-blocked plan and exactly one distribution route.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) => guarded(() => runBootstrap(cfg(configPath))),
  );

  server.registerTool(
    "verify_adapters",
    { title: "Verify adapters", description: "Same gate as bootstrap; verifies distribution adapters.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) => guarded(() => runBootstrap(cfg(configPath))),
  );

  server.registerTool(
    "doctor",
    { title: "Doctor", description: "Environment + project validation for the session target.", inputSchema: { configPath: optionalConfigPath } },
    async ({ configPath }) =>
      guarded(() => {
        const { config, targetRoot } = loadTarget(cfg(configPath));
        const findings = validateProject(targetRoot, config);
        const missingEnvironment = (config.requiredEnvironment ?? []).filter((name) => !process.env[name]);
        return {
          status: findings.some((finding) => finding.status === "BLOCKED") ? "BLOCKED" : missingEnvironment.length ? "WARNING" : "VERIFIED",
          node: process.version,
          runtimes: config.enabledRuntimes,
          distributionMode: config.distributionMode ?? "UNKNOWN",
          findings,
          missingEnvironment,
        };
      }),
  );

  server.registerTool(
    "find_skills",
    {
      title: "Find skills",
      description: "List project-local skills from the session target without executing target code.",
      inputSchema: {
        configPath: optionalConfigPath,
        query: z.string().optional().describe("Optional search text matched against skill names, descriptions, and paths"),
        limit: z.number().int().min(1).max(50).optional().describe("Maximum number of matches to return"),
      },
    },
    async ({ configPath, query, limit }) => guarded(() => {
      const { targetRoot } = loadTarget(cfg(configPath));
      return findProjectSkills(targetRoot, query, limit);
    }),
  );

  server.registerTool(
    "load_skill",
    {
      title: "Load skill",
      description: "Load a project-local SKILL.md by name or project path without executing target code.",
      inputSchema: {
        configPath: optionalConfigPath,
        name: z.string().describe("Skill name or SKILL.md project path"),
      },
    },
    async ({ configPath, name }) => guarded(() => {
      const { targetRoot } = loadTarget(cfg(configPath));
      return loadProjectSkill(targetRoot, name);
    }),
  );

  const withTransaction = { configPath: optionalConfigPath, transaction: z.string().describe("Transaction id") };

  server.registerTool(
    "stage",
    { title: "Stage transaction", description: "Stage a transaction manifest against the session target.", inputSchema: withTransaction },
    async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(cfg(configPath)); return stageTransaction(targetRoot, config, transaction); }),
  );

  server.registerTool(
    "verify",
    { title: "Verify transaction", description: "Verify a staged transaction against current hashes.", inputSchema: withTransaction },
    async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(cfg(configPath)); return verifyTransaction(targetRoot, config, transaction); }),
  );

  server.registerTool(
    "approve",
    {
      title: "Approve transaction",
      description: "Attach a human approval file already present in the clone to a verified transaction.",
      inputSchema: { ...withTransaction, approval: z.string().describe("Path to the approval file, inside the clone") },
    },
    async ({ configPath, transaction, approval }) => guarded(() => { const { config, targetRoot } = loadTarget(cfg(configPath)); return approveTransaction(targetRoot, config, transaction, approval); }),
  );

  server.registerTool(
    "apply",
    { title: "Apply transaction", description: "Apply an approved transaction. Destructive — writes only land in the ephemeral clone, never back to the real remote.", inputSchema: withTransaction },
    async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(cfg(configPath)); return applyTransaction(targetRoot, config, transaction); }),
  );

  server.registerTool(
    "rollback",
    { title: "Rollback transaction", description: "Hash-guarded rollback of an applied transaction.", inputSchema: withTransaction },
    async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(cfg(configPath)); return rollbackTransaction(targetRoot, config, transaction); }),
  );

  return server;
}

const transports = new Map<string, StreamableHTTPServerTransport>();

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

async function handleMcpRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sessionIdHeader = req.headers["mcp-session-id"];
  const sessionId = Array.isArray(sessionIdHeader) ? sessionIdHeader[0] : sessionIdHeader;

  if (sessionId && transports.has(sessionId)) {
    await transports.get(sessionId)!.handleRequest(req, res);
    return;
  }

  if (req.method === "POST") {
    const body = await readBody(req);
    if (!sessionId && isInitializeRequest(body)) {
      const sessionIdRef: { current: string | undefined } = { current: undefined };
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          sessionIdRef.current = newSessionId;
          transports.set(newSessionId, transport);
        },
      });
      transport.onclose = () => {
        if (sessionIdRef.current) {
          transports.delete(sessionIdRef.current);
          cleanupSession(sessionIdRef.current);
        }
      };
      const server = buildOrchestratorServer(sessionIdRef);
      // The SDK's own accessor typings for onclose don't structurally satisfy
      // Transport under this project's exactOptionalPropertyTypes — a type-only
      // mismatch, not a runtime one (verified against the stdio server above).
      await server.connect(transport as unknown as Transport);
      await transport.handleRequest(req, res, body);
      return;
    }
  }

  res.writeHead(400, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "No valid session. Send an initialize request first." }, id: null }));
}

const port = Number(process.env.PORT ?? 8787);

const httpServer = createServer((req, res) => {
  if (req.url === "/health" || req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(healthPayload()));
    return;
  }
  if (req.url === "/mcp" || req.url === "/") {
    handleMcpRequest(req, res).catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
    return;
  }
  res.writeHead(404);
  res.end();
});

httpServer.listen(port, () => {
  process.stderr.write(`toolsforcodex remote MCP server listening on :${port}\n`);
});
