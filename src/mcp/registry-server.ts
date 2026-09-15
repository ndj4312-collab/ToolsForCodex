#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { preflight } from "../config/load";
import type { OrchestratorConfig } from "../config/types";
import { findProjectSkills, loadProjectSkill } from "./skill-registry";

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

function targetRoot(configPath: string): string {
  const result = preflight(configPath);
  // Parse the same config as the broad server so malformed config remains fail-closed.
  JSON.parse(readFileSync(resolve(configPath), "utf8")) as OrchestratorConfig;
  return result.targetRoot;
}

const configPathSchema = { configPath: z.string().describe("Path to the orchestrator config JSON file") };
const findSkillsSchema = {
  ...configPathSchema,
  query: z.string().optional().describe("Optional search text matched against skill names, descriptions, and paths"),
  limit: z.number().int().min(1).max(50).optional().describe("Maximum number of matches to return"),
};
const loadSkillSchema = {
  ...configPathSchema,
  name: z.string().describe("Skill name or SKILL.md project path"),
};

const server = new McpServer({ name: "toolsforcodex-skill-registry", version: "0.2.0" });

server.registerTool(
  "find_skills",
  { title: "Find skills", description: "List project-local skills from the target tree without executing target code.", inputSchema: findSkillsSchema },
  async ({ configPath, query, limit }) => guarded(() => findProjectSkills(targetRoot(configPath), query, limit)),
);

server.registerTool(
  "load_skill",
  { title: "Load skill", description: "Load a project-local SKILL.md by name or project path without executing target code.", inputSchema: loadSkillSchema },
  async ({ configPath, name }) => guarded(() => loadProjectSkill(targetRoot(configPath), name)),
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
