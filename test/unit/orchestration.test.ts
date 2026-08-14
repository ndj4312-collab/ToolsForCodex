import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildCatalog } from "../../src/discovery/catalog";
import { analyzeDependencies } from "../../src/normalization/dependency-graph";
import { sha256, writeJson } from "../../src/utils/files";
import { applyTransaction, approveTransaction, rollbackTransaction, stageTransaction, verifyTransaction } from "../../src/transactions/engine";
import type { OrchestratorConfig } from "../../src/config/types";

function config(outputDirectory = ".orchestrator"): OrchestratorConfig {
  return { schemaVersion: "1.0", targetRoot: ".", auditIgnore: [], allowedWriteRoots: ["."], enabledRuntimes: ["codex"], securityMode: "approved-transactions", outputDirectory, distributionMode: "skills-sh-editable", requiredEnvironment: [] };
}

describe("orchestration stages", () => {
  it("produces a deterministic catalog without executing source files", () => {
    const root = mkdtempSync(join(tmpdir(), "orchestrator-catalog-"));
    writeFileSync(join(root, "README.md"), "# fixture\n", "utf8");
    const first = buildCatalog(root, config());
    const second = buildCatalog(root, config());
    expect(first.overallDigest).toBe(second.overallDigest);
    expect(first.assets.map((asset) => asset.path)).toEqual(second.assets.map((asset) => asset.path));
  });

  it("detects cycles and user-to-user dependency edges", () => {
    const a = { name: "alpha", invocationMode: "user" as const, lifecycleBucket: "engineering" as const, portableInstructions: "", declaredInputs: [], declaredOutputs: [], dependencies: ["/beta"] as const, ownedReferenceFiles: [], runtimeCapabilityRequirements: [], sourceHash: "a".repeat(64), reviewState: "reviewed" as const, distributionMode: "claude-plugin" as const };
    const b = { ...a, name: "beta", invocationMode: "user" as const, dependencies: ["/alpha"] as const };
    const result = analyzeDependencies([a, b]);
    expect(result.cycles).toHaveLength(1);
    expect(result.userToUser).toHaveLength(2);
  });

  it("requires verification and matching approval before applying, then rolls back safely", () => {
    const root = mkdtempSync(join(tmpdir(), "orchestrator-transaction-"));
    const target = join(root, "README.md");
    const original = "original\n"; const replacement = "replacement\n";
    writeFileSync(target, original, "utf8");
    const output = join(root, ".orchestrator", "standardization", "patches");
    writeJson(join(output, "candidate.json"), { path: "README.md", originalHash: sha256(original), replacementHash: sha256(replacement), ruleId: "test-replacement", replacement });
    const transaction = stageTransaction(root, config(), "TX-001");
    expect(transaction.status).toBe("STAGED");
    expect(verifyTransaction(root, config(), "TX-001").status).toBe("VERIFIED");
    const approval = join(root, "approval.json");
    writeJson(approval, { schemaVersion: "1.0", transactionId: "TX-001", planDigest: transaction.planDigest, approvedAt: "2026-08-14T00:00:00.000Z", allowedOperations: ["replace"] });
    expect(approveTransaction(root, config(), "TX-001", approval).status).toBe("APPROVED");
    expect(applyTransaction(root, config(), "TX-001").status).toBe("APPLIED");
    expect(readFileSync(target, "utf8")).toBe(replacement);
    expect(rollbackTransaction(root, config(), "TX-001").status).toBe("ROLLED_BACK");
    expect(readFileSync(target, "utf8")).toBe(original);
  });
});
