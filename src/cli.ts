import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { preflight, PreflightError } from "./config/load";
import type { OrchestratorConfig } from "./config/types";
import { buildCatalog, writeCatalogOutputs } from "./discovery/catalog";
import { writeStandardizationOutputs } from "./normalization/skill-normalizer";
import { generateBootstrap } from "./bootstrap/generate";
import { approveTransaction, applyTransaction, rollbackTransaction, stageTransaction, verifyTransaction } from "./transactions/engine";
import { validateProject } from "./validation/project";
import { writeProposalOutputs } from "./proposals/generate";

function usage(): string {
  return "Usage: orchestrator <preflight|audit|catalog|plan|propose|bootstrap|verify-adapters|doctor|stage|verify|approve|apply|rollback> --config <path> [--transaction <id>] [--approval <path>]";
}

function parseArguments(argumentsList: readonly string[]): { command: string; configPath: string; transaction?: string; approval?: string } {
  const [command, ...args] = argumentsList;
  if (!command) throw new PreflightError(usage());
  let configPath = ""; let transaction: string | undefined; let approval: string | undefined;
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index]; const value = args[index + 1];
    if (!value || (flag !== "--config" && flag !== "--transaction" && flag !== "--approval")) throw new PreflightError(usage());
    if (flag === "--config") configPath = value; else if (flag === "--transaction") transaction = value; else approval = value;
  }
  if (!configPath) throw new PreflightError(usage());
  return { command, configPath, ...(transaction ? { transaction } : {}), ...(approval ? { approval } : {}) };
}

function loadTarget(configPath: string): { config: OrchestratorConfig; targetRoot: string } {
  const result = preflight(configPath);
  const config = JSON.parse(readFileSync(resolve(configPath), "utf8")) as OrchestratorConfig;
  return { config, targetRoot: result.targetRoot };
}

function requireTransaction(value: string | undefined): string { if (!value) throw new PreflightError("--transaction is required"); return value; }

function main(): void {
  try {
    const parsed = parseArguments(process.argv.slice(2));
    if (parsed.command === "preflight") process.stdout.write(`${JSON.stringify(preflight(parsed.configPath))}\n`);
    else {
      const { config, targetRoot } = loadTarget(parsed.configPath);
      let result: unknown;
      if (parsed.command === "audit") { const before = buildCatalog(targetRoot, config); const catalog = writeCatalogOutputs(targetRoot, config); const after = buildCatalog(targetRoot, config); if (before.overallDigest !== after.overallDigest) throw new PreflightError("Read-only audit changed the target tree"); result = { ...catalog, readOnlyCheck: "VERIFIED" }; }
      else if (parsed.command === "catalog") result = writeCatalogOutputs(targetRoot, config);
      else if (parsed.command === "plan") result = writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode);
      else if (parsed.command === "propose") {
        const catalog = writeCatalogOutputs(targetRoot, config);
        const plan = writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode);
        result = writeProposalOutputs(targetRoot, config, catalog, plan);
      }
      else if (parsed.command === "bootstrap" || parsed.command === "verify-adapters") {
        const plan = writeStandardizationOutputs(targetRoot, config.outputDirectory, config.distributionMode);
        if (plan.status === "BLOCKED") throw new PreflightError("Bootstrap blocked by standardization findings");
        result = generateBootstrap(targetRoot, config, plan.candidates.map((candidate) => candidate.skill));
      } else if (parsed.command === "doctor") {
        const findings = validateProject(targetRoot, config); const missingEnvironment = (config.requiredEnvironment ?? []).filter((name) => !process.env[name]);
        result = { status: findings.some((finding) => finding.status === "BLOCKED") ? "BLOCKED" : missingEnvironment.length ? "WARNING" : "VERIFIED", node: process.version, runtimes: config.enabledRuntimes, distributionMode: config.distributionMode ?? "UNKNOWN", findings, missingEnvironment };
      } else if (parsed.command === "stage") result = stageTransaction(targetRoot, config, requireTransaction(parsed.transaction));
      else if (parsed.command === "verify") result = verifyTransaction(targetRoot, config, requireTransaction(parsed.transaction));
      else if (parsed.command === "approve") result = approveTransaction(targetRoot, config, requireTransaction(parsed.transaction), parsed.approval ?? "");
      else if (parsed.command === "apply") result = applyTransaction(targetRoot, config, requireTransaction(parsed.transaction));
      else if (parsed.command === "rollback") result = rollbackTransaction(targetRoot, config, requireTransaction(parsed.transaction));
      else throw new PreflightError(usage());
      process.stdout.write(`${JSON.stringify(result)}\n`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    process.stderr.write(`${JSON.stringify({ status: "INVALID", error: message })}\n`);
    process.exitCode = 1;
  }
}

main();
