import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { isAbsolute, parse, relative, resolve, sep } from "node:path";
import type { OrchestratorConfig, VerifiedPreflight } from "./types";
import { formatSchemaErrors, validateOrchestratorConfig } from "../validation/schema";

export class PreflightError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "PreflightError";
  }
}

function isWithin(root: string, candidate: string): boolean {
  const relativePath = relative(root, candidate);
  return relativePath === "" || (!relativePath.startsWith(`..${sep}`) && relativePath !== ".." && !isAbsolute(relativePath));
}

function readConfig(configPath: string): { config: OrchestratorConfig; source: Buffer } {
  if (!existsSync(configPath)) throw new PreflightError(`Config file does not exist: ${configPath}`);
  let source: Buffer;
  let parsed: unknown;
  try {
    source = readFileSync(configPath);
    parsed = JSON.parse(source.toString("utf8")) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    throw new PreflightError(`Invalid JSON configuration: ${message}`);
  }
  if (!validateOrchestratorConfig(parsed)) throw new PreflightError(`Invalid configuration: ${formatSchemaErrors(validateOrchestratorConfig.errors)}`);
  return { config: parsed, source };
}

export function preflight(configPathArgument: string): VerifiedPreflight {
  const configPath = resolve(configPathArgument);
  const { config, source } = readConfig(configPath);
  const configDirectory = resolve(configPath, "..");
  const targetRoot = resolve(configDirectory, config.targetRoot);
  if (parse(targetRoot).root === targetRoot) throw new PreflightError("Target root cannot be a filesystem root");
  if (!existsSync(targetRoot) || !statSync(targetRoot).isDirectory()) throw new PreflightError(`Target root does not exist or is not a directory: ${targetRoot}`);
  for (const writeRoot of config.allowedWriteRoots) {
    const resolvedWriteRoot = resolve(targetRoot, writeRoot);
    if (!isWithin(targetRoot, resolvedWriteRoot)) throw new PreflightError(`Write root escapes target root: ${writeRoot}`);
  }
  const outputDirectory = resolve(targetRoot, config.outputDirectory);
  if (!isWithin(targetRoot, outputDirectory)) throw new PreflightError(`Output directory escapes target root: ${config.outputDirectory}`);
  return {
    schemaVersion: "1.0",
    status: "VERIFIED",
    timestamp: new Date().toISOString(),
    targetRoot,
    configPath,
    evidence: [{ type: "config-schema", locator: "orchestrator.config.schema.json", sha256: createHash("sha256").update(source).digest("hex") }]
  };
}
