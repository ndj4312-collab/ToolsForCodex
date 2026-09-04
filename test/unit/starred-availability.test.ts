import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

describe("starred availability registry", () => {
  it("turns classified starred records into no-exec source locator availability records", () => {
    const root = mkdtempSync(join(tmpdir(), "starred-availability-"));
    const input = join(root, "classified.json");
    const output = join(root, "registry.json");
    const markdown = join(root, "registry.md");
    writeFileSync(
      input,
      `${JSON.stringify({
        generatedAt: "2026-09-02T00:00:00.000Z",
        count: 3,
        records: [
          {
            fullName: "github/awesome-copilot",
            htmlUrl: "https://github.com/github/awesome-copilot",
            defaultBranch: "main",
            relevanceBand: "DIRECT_TOOLSFORCODEX_OVERLAP",
            licenseSpdx: "MIT",
            licenseState: "LICENSE_METADATA_PERMISSIVE",
            accessStates: ["METADATA_READABLE", "STATIC_FILES_READABLE"],
            sessionUse: ["cloud:cloneable"]
          },
          {
            fullName: "tt-a1i/archify",
            htmlUrl: "https://github.com/tt-a1i/archify",
            defaultBranch: "main",
            relevanceBand: "DIRECT_TOOLSFORCODEX_OVERLAP",
            licenseSpdx: "MIT",
            licenseState: "LICENSE_METADATA_PERMISSIVE",
            accessStates: ["METADATA_READABLE", "STATIC_FILES_READABLE"],
            sessionUse: ["cloud:cloneable"]
          },
          {
            fullName: "public-apis/public-apis",
            htmlUrl: "https://github.com/public-apis/public-apis",
            defaultBranch: "master",
            relevanceBand: "SECONDARY_UTILITY_OVERLAP",
            licenseSpdx: "MIT",
            licenseState: "LICENSE_METADATA_PERMISSIVE",
            accessStates: ["METADATA_READABLE", "STATIC_FILES_READABLE"],
            sessionUse: ["cloud:cloneable"]
          }
        ]
      })}\n`,
      "utf8",
    );

    execFileSync(
      process.execPath,
      [
        "scripts/starred-availability.mjs",
        "--from-file",
        input,
        "--out",
        output,
        "--markdown",
        markdown,
        "--generated-at",
        "2026-09-02T10:00:35.000Z"
      ],
      { cwd: process.cwd(), stdio: "pipe" },
    );

    const registry = JSON.parse(readFileSync(output, "utf8"));
    expect(registry.summary).toMatchObject({ total: 3, directOverlap: 2, importCandidates: 2 });
    expect(registry.repositories.find((repo: { fullName: string }) => repo.fullName === "github/awesome-copilot")).toMatchObject({
      queueState: "IMPORT_CANDIDATE",
      availabilityStage: "ADAPTER_NEXT",
      noExecStatus: "INTAKE_POLICY_NO_TARGET_CODE_EXECUTION"
    });
    expect(registry.repositories.find((repo: { fullName: string }) => repo.fullName === "public-apis/public-apis")).toMatchObject({
      queueState: "NOT_EVALUATED",
      availabilityStage: "SOURCE_LOCATORS_AVAILABLE"
    });
    expect(readFileSync(markdown, "utf8")).toContain("vendor repository contents");
    expect(readFileSync(markdown, "utf8")).toContain("does not yet plug those records into the main source-record/catalog loader");
  });
});
