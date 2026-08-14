import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

const contractsDirectory = join(__dirname, "../../contracts");
const hash = "a".repeat(64);
const evidence = [{ kind: "test", locator: "test://fixture" }];
const source = { locator: "test://source" };

const samples: Record<string, object> = {
  "asset.schema.json": { schemaVersion: "1.0", id: "asset-one", path: "skills/one.md", sha256: hash, observedAt: "2026-01-01T00:00:00.000Z", source, evidence },
  "catalog.schema.json": { schemaVersion: "1.0", id: "catalog-one", generatedAt: "2026-01-01T00:00:00.000Z", targetPath: "repo", exclusions: ["node_modules"], assets: [{ id: "asset-one", path: "one", kind: "file", sha256: hash, parseStatus: "PARSED", classifications: ["Documentation"] }], overallDigest: hash, evidence },
  "diagnostic-result.schema.json": { schemaVersion: "1.0", id: "diagnostic-one", createdAt: "2026-01-01T00:00:00.000Z", severity: "info", status: "VERIFIED", source, reason: "test evidence", evidence },
  "execution-plan.schema.json": { schemaVersion: "1.0", id: "plan-one", createdAt: "2026-01-01T00:00:00.000Z", status: "draft", source, steps: [{ id: "step-one", path: "a", sha256: hash, status: "pending" }], evidence },
  "transaction.schema.json": { schemaVersion: "1.0", id: "transaction-one", createdAt: "2026-01-01T00:00:00.000Z", status: "STAGED", source, manifestHash: hash, operations: [], evidence },
  "approval.schema.json": { schemaVersion: "1.0", transactionId: "transaction-one", planDigest: hash, approvedAt: "2026-01-01T00:00:00.000Z", allowedOperations: ["replace"] },
  "runtime-adapter.schema.json": { schemaVersion: "1.0", id: "adapter-one", generatedAt: "2026-01-01T00:00:00.000Z", runtime: "codex", source, sourceHash: hash, status: "generated", evidence }
  ,"standardization-plan.schema.json": { schemaVersion: "1.0", profile: { name: "test", upstreamRepository: "https://example.com/profile", retrievedAt: "2026-01-01T00:00:00.000Z", sourceRevision: "test" }, status: "VERIFIED", candidates: [], graph: { edges: [], missing: [], cycles: [], userToUser: [] }, styleContract: { status: "UNKNOWN", contracts: [] }, digest: hash }
  ,"runtime-equivalence.schema.json": { schemaVersion: "1.0", status: "VERIFIED", adapters: [], differences: [], skills: [] }
  ,"proposal-bundle.schema.json": { schemaVersion: "1.0", status: "PROPOSED", targetPath: ".", sourceDigest: hash, components: [], coordinator: { paths: ["AGENTS.md"], files: ["AGENTS.md"] }, indexes: ["INDEX.md"], files: [{ path: "AGENTS.md", kind: "coordinator", content: "proposal", evidence: ["README.md"] }], limitations: ["review"], digest: hash }
};

describe("canonical contracts", () => {
  it("round-trip valid samples and reject unknown fields", () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    addFormats(ajv);
    for (const file of readdirSync(contractsDirectory)) {
      const validate = ajv.compile(JSON.parse(readFileSync(join(contractsDirectory, file), "utf8")) as object);
      const sample = samples[file];
      expect(sample).toBeDefined();
      expect(validate(sample)).toBe(true);
      expect(validate({ ...sample, unexpected: true })).toBe(false);
    }
  });
});
