import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { preflight, PreflightError } from "../../src/config/load";

function createConfig(overrides: Record<string, unknown> = {}): string {
  const directory = mkdtempSync(join(tmpdir(), "orchestrator-config-"));
  const target = join(directory, "target");
  mkdirSync(target);
  const configPath = join(directory, "config.json");
  writeFileSync(configPath, JSON.stringify({
    schemaVersion: "1.0",
    targetRoot: "target",
    auditIgnore: [],
    allowedWriteRoots: [],
    enabledRuntimes: ["codex"],
    securityMode: "read-only",
    outputDirectory: ".orchestrator",
    ...overrides
  }));
  return configPath;
}

describe("preflight configuration", () => {
  it("rejects unknown configuration fields", () => {
    expect(() => preflight(createConfig({ shellCommand: "do-not-run" }))).toThrow(PreflightError);
  });

  it("rejects write roots that escape the target root", () => {
    expect(() => preflight(createConfig({ allowedWriteRoots: ["../outside"] }))).toThrow(PreflightError);
  });

  it("returns verified evidence without creating target files", () => {
    const result = preflight(createConfig());
    expect(result.status).toBe("VERIFIED");
    expect(result.evidence[0].sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
