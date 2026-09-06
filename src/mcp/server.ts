#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { preflight, PreflightError } from "../config/load";
import type { OrchestratorConfig } from "../config/types";
import { buildCatalog, writeCatalogOutputs } from "../discovery/catalog";
import { writeStandardizationOutputs } from "../normalization/skill-normalizer";
import { generateBootstrap } from "../bootstrap/generate";
import {
  approveTransaction,
  applyTransaction,
  rollbackTransaction,
  stageTransaction,
  verifyTransaction,
} from "../transactions/engine";
import { validateProject } from "../validation/project";
import { writeProposalOutputs } from "../proposals/generate";
import { findProjectSkills, loadProjectSkill } from "./skill-registry";
import { findProjectKnowledge, loadProjectKnowledge } from "../knowledge/router";

/**
 * MCP wrapper for the production-orchestration-kit CLI.
 *
 * This is a thin protocol adapter: every tool here calls the exact same
 * functions `src/cli.ts` calls, in the same order, with the same guards.
 * It does not loosen any of the CLI's existing safety contract (read-only
 * audit digest check, blocked-plan gate on bootstrap, stage/verify/approve/
 * apply/rollback transaction sequencing). See AGENTS.md for that contract.
 */

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

const configPathSchema = { configPath: z.string().describe("Path to the orchestrator config JSON file") };
const transactionSchema = { ...configPathSchema, transaction: z.string().describe("Transaction id") };
const findSkillsSchema = {
  ...configPathSchema,
  query: z.string().optional().describe("Optional search text matched against skill names, descriptions, and paths"),
  limit: z.number().int().min(1).max(50).optional().describe("Maximum number of matches to return"),
};
const loadSkillSchema = {
  ...configPathSchema,
  name: z.string().describe("Skill name or SKILL.md project path"),
};
const findKnowledgeSchema = {
  ...configPathSchema,
  query: z.string().describe("Search text used to route to canonical source locators"),
  limit: z.number().int().min(1).max(50).optional().describe("Maximum number of knowledge routes to return"),
};
const loadKnowledgeSchema = {
  ...configPathSchema,
  id: z.string().describe("Knowledge route id returned by find_knowledge"),
};

const server = new McpServer({ name: "toolsforcodex", version: "0.2.0" });

server.registerTool(
  "preflight",
  { title: "Preflight", description: "Validate an orchestrator config and resolve the target root. Read-only.", inputSchema: configPathSchema },
  async ({ configPath }) => guarded(() => preflight(configPath)),
);

server.registerTool(
  "audit",
  { title: "Audit", description: "Read-only repository audit. Fails if the target tree changes during the audit.", inputSchema: configPathSchema },
  async ({ configPath }) =>
    guarded(() => {
      const { config, targetRoot } = loadTarget(configPath);
      const before = buildCatalog(targetRoot, config);
      const catalog = writeCatalogOutputs(targetRoot, config);
      const after = buildCatalog(targetRoot, config);
      if (before.overallDigest !== after.overallDigest) throw new PreflightError("Read-only audit changed the target tree");
      return { ...catalog, readOnlyCheck: "VERIFIED" };
    }),
);

server.registerTool(
  "catalog",
  { title: "Catalog", description: "Build and write the discovery catalog for the target tree.", inputSchema: configPathSchema },
  async ({ configPath }) => guarded(() => { const { config, targetRoot } = loadTarget(configPath); return writeCatalogOutputs(targetRoot, config); }),
);

server.registerTool(
  "plan",
  { title: "Plan", description: "Build a standardization plan. Preserves source files; emits reviewable candidates.", inputSchema: configPathSchema },
  async ({ configPath }) =>
    guarded(() => { const { config, targetRoot } = loadTarget(configPath); return writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode); }),
);

server.registerTool(
  "propose",
  { title: "Propose", description: "Create review-only coordinator/index/metadata/manifest candidates under .orchestrator/proposals/.", inputSchema: configPathSchema },
  async ({ configPath }) =>
    guarded(() => {
      const { config, targetRoot } = loadTarget(configPath);
      const catalog = writeCatalogOutputs(targetRoot, config);
      const plan = writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode);
      return writeProposalOutputs(targetRoot, config, catalog, plan);
    }),
);

function runBootstrap(configPath: string) {
  const { config, targetRoot } = loadTarget(configPath);
  const plan = writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode);
  if (plan.status === "BLOCKED") throw new PreflightError("Bootstrap blocked by standardization findings");
  return generateBootstrap(targetRoot, config, plan.candidates.map((candidate) => candidate.skill));
}

server.registerTool(
  "bootstrap",
  { title: "Bootstrap", description: "Requires a non-blocked plan and exactly one distribution route.", inputSchema: configPathSchema },
  async ({ configPath }) => guarded(() => runBootstrap(configPath)),
);

server.registerTool(
  "verify_adapters",
  { title: "Verify adapters", description: "Same gate as bootstrap; verifies distribution adapters.", inputSchema: configPathSchema },
  async ({ configPath }) => guarded(() => runBootstrap(configPath)),
);

server.registerTool(
  "doctor",
  { title: "Doctor", description: "Environment + project validation. Reports BLOCKED / WARNING / VERIFIED.", inputSchema: configPathSchema },
  async ({ configPath }) =>
    guarded(() => {
      const { config, targetRoot } = loadTarget(configPath);
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
  { title: "Find skills", description: "List project-local skills from the target tree without executing target code.", inputSchema: findSkillsSchema },
  async ({ configPath, query, limit }) => guarded(() => {
    const { targetRoot } = loadTarget(configPath);
    return findProjectSkills(targetRoot, query, limit);
  }),
);

server.registerTool(
  "load_skill",
  { title: "Load skill", description: "Load a project-local SKILL.md by name or project path without executing target code.", inputSchema: loadSkillSchema },
  async ({ configPath, name }) => guarded(() => {
    const { targetRoot } = loadTarget(configPath);
    return loadProjectSkill(targetRoot, name);
  }),
);

server.registerTool(
  "find_knowledge",
  { title: "Find knowledge", description: "Route a query to compact derived knowledge entries and their canonical source locators. Read-only; canonical sources always win.", inputSchema: findKnowledgeSchema },
  async ({ configPath, query, limit }) => guarded(() => {
    const { targetRoot } = loadTarget(configPath);
    return findProjectKnowledge(targetRoot, query, limit);
  }),
);

server.registerTool(
  "load_knowledge",
  { title: "Load knowledge", description: "Load a derived knowledge route by id with canonical-source precedence, freshness, and conflict metadata. Unknown ids fail closed.", inputSchema: loadKnowledgeSchema },
  async ({ configPath, id }) => guarded(() => {
    const { targetRoot } = loadTarget(configPath);
    return loadProjectKnowledge(targetRoot, id);
  }),
);

server.registerTool(
  "stage",
  { title: "Stage transaction", description: "Stage a transaction manifest. First step of the write gate.", inputSchema: transactionSchema },
  async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(configPath); return stageTransaction(targetRoot, config, transaction); }),
);

server.registerTool(
  "verify",
  { title: "Verify transaction", description: "Verify a staged transaction against current hashes.", inputSchema: transactionSchema },
  async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(configPath); return verifyTransaction(targetRoot, config, transaction); }),
);

server.registerTool(
  "approve",
  {
    title: "Approve transaction",
    description: "Attach a human approval file to a verified transaction. Requires a real approval file on disk — this tool does not create one.",
    inputSchema: { ...transactionSchema, approval: z.string().describe("Path to the human approval file") },
  },
  async ({ configPath, transaction, approval }) => guarded(() => { const { config, targetRoot } = loadTarget(configPath); return approveTransaction(targetRoot, config, transaction, approval); }),
);

server.registerTool(
  "apply",
  { title: "Apply transaction", description: "Apply an approved transaction to the target tree. Destructive — requires prior stage/verify/approve.", inputSchema: transactionSchema },
  async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(configPath); return applyTransaction(targetRoot, config, transaction); }),
);

server.registerTool(
  "rollback",
  { title: "Rollback transaction", description: "Hash-guarded rollback of an applied transaction.", inputSchema: transactionSchema },
  async ({ configPath, transaction }) => guarded(() => { const { config, targetRoot } = loadTarget(configPath); return rollbackTransaction(targetRoot, config, transaction); }),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});