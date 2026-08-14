import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { OrchestratorConfig } from "../config/types";
import { assertTransition, type TransactionState } from "./state";
import { isWithin, readJson, sha256, stableStringify, writeJson } from "../utils/files";

export interface Operation { readonly path: string; readonly operation: "create" | "replace" | "delete"; readonly originalHash: string; readonly stagedHash: string; readonly sourceRuleIds: readonly string[]; }
export interface TransactionManifest { readonly schemaVersion: "1.0"; readonly id: string; readonly createdAt: string; readonly status: TransactionState; readonly planDigest: string; readonly operations: readonly Operation[]; readonly evidence: readonly { kind: string; locator: string }[]; }

function transactionRoot(targetRoot: string, config: OrchestratorConfig, id: string): string { return join(resolve(targetRoot, config.outputDirectory), "transactions", id); }
function manifestPath(targetRoot: string, config: OrchestratorConfig, id: string): string { return join(transactionRoot(targetRoot, config, id), "manifest.json"); }
function load(targetRoot: string, config: OrchestratorConfig, id: string): TransactionManifest { return readJson(manifestPath(targetRoot, config, id)) as TransactionManifest; }
function save(targetRoot: string, config: OrchestratorConfig, manifest: TransactionManifest): void { writeJson(manifestPath(targetRoot, config, manifest.id), manifest); }
function next(manifest: TransactionManifest, status: TransactionState): TransactionManifest { assertTransition(manifest.status, status); return { ...manifest, status }; }
function writeAllowed(targetRoot: string, config: OrchestratorConfig, path: string): boolean { return config.allowedWriteRoots.length > 0 && config.allowedWriteRoots.some((root) => isWithin(resolve(targetRoot, root), resolve(targetRoot, path))); }

interface CandidateOperation extends Operation { readonly replacement?: string }
function sourceOperations(targetRoot: string, config: OrchestratorConfig): CandidateOperation[] {
  const patchDirectory = join(resolve(targetRoot, config.outputDirectory), "standardization", "patches");
  if (!existsSync(patchDirectory)) return [];
  return readdirSync(patchDirectory).filter((name) => name.endsWith(".json")).sort().map((name) => {
    const candidate = readJson(join(patchDirectory, name)) as { path: string; originalHash: string; replacementHash: string; replacement?: string; ruleId?: string };
    return { path: candidate.path, operation: candidate.originalHash === "absent" ? "create" : "replace", originalHash: candidate.originalHash, stagedHash: candidate.replacementHash, sourceRuleIds: candidate.ruleId ? [candidate.ruleId] : [], ...(candidate.replacement === undefined ? {} : { replacement: candidate.replacement }) };
  });
}

export function stageTransaction(targetRoot: string, config: OrchestratorConfig, id: string): TransactionManifest {
  if (config.securityMode !== "approved-transactions") throw new Error("Transaction staging requires securityMode=approved-transactions");
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw new Error("Invalid transaction id");
  const root = transactionRoot(targetRoot, config, id);
  mkdirSync(join(root, "staged"), { recursive: true });
  const candidates = sourceOperations(targetRoot, config);
  const operations: Operation[] = candidates.map((candidate) => ({ path: candidate.path, operation: candidate.operation, originalHash: candidate.originalHash, stagedHash: candidate.stagedHash, sourceRuleIds: candidate.sourceRuleIds }));
  const planDigest = sha256(stableStringify(operations));
  const manifest: TransactionManifest = { schemaVersion: "1.0", id, createdAt: new Date().toISOString(), status: "PLANNED", planDigest, operations, evidence: [{ kind: "stage", locator: `file://${root}` }] };
  save(targetRoot, config, next(manifest, "STAGED"));
  for (const candidate of candidates) {
    const operation = candidate;
    if (!isWithin(resolve(targetRoot), resolve(targetRoot, operation.path)) || !writeAllowed(targetRoot, config, operation.path)) throw new Error(`Operation is outside an allowed write root: ${operation.path}`);
    const stagedPath = join(root, "staged", operation.path);
    mkdirSync(dirname(stagedPath), { recursive: true });
    if (operation.operation !== "delete") {
      const targetPath = resolve(targetRoot, operation.path);
      if (operation.operation === "replace" && (!existsSync(targetPath) || sha256(readFileSync(targetPath)) !== operation.originalHash)) throw new Error(`Source drift detected before stage: ${operation.path}`);
      if (operation.operation === "create" && existsSync(targetPath)) throw new Error(`Create target already exists: ${operation.path}`);
      writeFileSync(stagedPath, candidate.replacement ?? readFileSync(targetPath));
      if (operation.operation === "replace") { const rollback = join(root, "rollback", operation.path); mkdirSync(dirname(rollback), { recursive: true }); writeFileSync(rollback, readFileSync(targetPath)); }
    }
  }
  return load(targetRoot, config, id);
}

export function verifyTransaction(targetRoot: string, config: OrchestratorConfig, id: string): TransactionManifest {
  const current = load(targetRoot, config, id);
  if (current.status !== "STAGED" && current.status !== "VERIFIED") throw new Error(`Transaction must be STAGED before verify; found ${current.status}`);
  for (const operation of current.operations) {
    const target = resolve(targetRoot, operation.path);
    if (!writeAllowed(targetRoot, config, operation.path)) { save(targetRoot, config, next(current, "FAILED")); throw new Error(`Operation is outside an allowed write root: ${operation.path}`); }
    const exists = existsSync(target);
    if (operation.operation !== "create" && (!exists || sha256(readFileSync(target)) !== operation.originalHash)) { save(targetRoot, config, next(current, "FAILED")); throw new Error(`Source drift detected: ${operation.path}`); }
    if (operation.operation === "create" && exists) { save(targetRoot, config, next(current, "FAILED")); throw new Error(`Create target already exists: ${operation.path}`); }
    const staged = join(transactionRoot(targetRoot, config, id), "staged", operation.path);
    if (operation.operation !== "delete" && (!existsSync(staged) || sha256(readFileSync(staged)) !== operation.stagedHash)) { save(targetRoot, config, next(current, "FAILED")); throw new Error(`Staged tampering detected: ${operation.path}`); }
  }
  return saveAndReturn(targetRoot, config, next(current, "VERIFIED"));
}

function saveAndReturn(targetRoot: string, config: OrchestratorConfig, manifest: TransactionManifest): TransactionManifest { save(targetRoot, config, manifest); return manifest; }

export function approveTransaction(targetRoot: string, config: OrchestratorConfig, id: string, approvalPath: string): TransactionManifest {
  const current = load(targetRoot, config, id);
  const approval = readJson(approvalPath) as { transactionId: string; planDigest: string; approvedAt: string; allowedOperations: readonly string[] };
  if (approval.transactionId !== id || approval.planDigest !== current.planDigest || !Array.isArray(approval.allowedOperations)) throw new Error("Approval does not match the current transaction");
  if (current.operations.some((operation) => !approval.allowedOperations.includes(operation.operation))) throw new Error("Approval does not authorize every transaction operation");
  return saveAndReturn(targetRoot, config, next(current, "APPROVED"));
}

export function applyTransaction(targetRoot: string, config: OrchestratorConfig, id: string): TransactionManifest {
  const current = load(targetRoot, config, id);
  if (current.status !== "APPROVED") throw new Error(`Transaction must be APPROVED before apply; found ${current.status}`);
  for (const operation of current.operations) {
    const target = resolve(targetRoot, operation.path);
    if (!isWithin(resolve(targetRoot), target) || !writeAllowed(targetRoot, config, operation.path)) throw new Error(`Write is outside an allowed write root: ${operation.path}`);
    if (operation.operation === "delete") { if (existsSync(target)) unlinkSync(target); continue; }
    mkdirSync(dirname(target), { recursive: true });
    const temporary = `${target}.orchestrator-tmp-${id}`;
    writeFileSync(temporary, readFileSync(join(transactionRoot(targetRoot, config, id), "staged", operation.path)), "utf8");
    renameSync(temporary, target);
  }
  return saveAndReturn(targetRoot, config, next(current, "APPLIED"));
}

export function rollbackTransaction(targetRoot: string, config: OrchestratorConfig, id: string): TransactionManifest {
  const current = load(targetRoot, config, id);
  if (current.status !== "APPLIED") throw new Error(`Transaction must be APPLIED before rollback; found ${current.status}`);
  for (const operation of current.operations) {
    const target = resolve(targetRoot, operation.path);
    if (!writeAllowed(targetRoot, config, operation.path)) throw new Error(`Rollback is outside an allowed write root: ${operation.path}`);
    if (!existsSync(target) || sha256(readFileSync(target)) !== operation.stagedHash) throw new Error(`Rollback conflict: ${operation.path}`);
    if (operation.originalHash === "absent") unlinkSync(target);
    else {
      const backup = join(transactionRoot(targetRoot, config, id), "rollback", operation.path);
      if (!existsSync(backup)) throw new Error(`Rollback copy missing: ${operation.path}`);
      mkdirSync(dirname(target), { recursive: true });
      renameSync(backup, target);
    }
  }
  return saveAndReturn(targetRoot, config, next(current, "ROLLED_BACK"));
}
