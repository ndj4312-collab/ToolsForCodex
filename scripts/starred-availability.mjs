#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

const DETERMINISTIC_TIMESTAMP = "1970-01-01T00:00:00.000Z";

const DIRECT_DESIGN = new Map([
  ["TencentCloud/TencentDB-Agent-Memory", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "NEEDS_MODIFICATION", availabilityStage: "DESIGNED_ADAPTER", integrationForm: "opt-in memory-provider adapter design; no default capture" }],
  ["VoltAgent/awesome-agent-skills", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "NEEDS_MODIFICATION", availabilityStage: "SOURCE_REGISTRY_INPUT", integrationForm: "metadata/provenance source registry; do not copy skill bodies" }],
  ["VoltAgent/awesome-claude-code-subagents", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "DEFER", availabilityStage: "LICENSED_STATIC_SOURCE", integrationForm: "study manifest/category structure; installer remains no-exec" }],
  ["VoltAgent/awesome-design-md", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "DEFER", availabilityStage: "LICENSED_STATIC_SOURCE", integrationForm: "extract design-doc patterns after duplicate/style review" }],
  ["ai-boost/awesome-prompts", { licenseState: "LICENSE_NEEDS_REVIEW", queueState: "DEFER", availabilityStage: "REFERENCE_LOCATORS_ONLY", integrationForm: "mechanism-only notes or external locators; do not copy/adapt prompt text" }],
  ["alibaba/page-agent", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "NEEDS_MODIFICATION", availabilityStage: "LICENSED_STATIC_SOURCE", integrationForm: "static screen agent/browser boundary before any runtime use" }],
  ["e2b-dev/awesome-ai-agents", { licenseState: "LICENSE_BLOCKED_FOR_IMPORT", queueState: "REFERENCE_ONLY", availabilityStage: "REFERENCE_LOCATORS_ONLY", integrationForm: "source discovery only unless legal review clears noncommercial share-alike terms" }],
  ["enescingoz/awesome-n8n-templates", { licenseState: "LICENSE_OK_FOR_REFERENCE;LICENSE_NEEDS_ATTRIBUTION_FOR_ADAPTATION", queueState: "NEEDS_MODIFICATION", availabilityStage: "REFERENCE_WITH_ATTRIBUTION_REQUIRED", integrationForm: "extract trigger/failure patterns with attribution; do not bulk-copy workflows" }],
  ["github/awesome-copilot", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "IMPORT_CANDIDATE", availabilityStage: "ADAPTER_NEXT", integrationForm: "static registry/validator adapter over agents/instructions/skills/hooks/workflows/plugins" }],
  ["hanishrao/collective-ai-tools", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "DEFER", availabilityStage: "LICENSED_STATIC_SOURCE", integrationForm: "inspect manifest/search primitive later" }],
  ["tashfeenahmed/freellmapi", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "NEEDS_MODIFICATION", availabilityStage: "LICENSED_RUNTIME_RISK", integrationForm: "model endpoint adapter only after credential/abuse/cost guardrails" }],
  ["travisvn/awesome-claude-skills", { licenseState: "LICENSE_UNKNOWN", queueState: "DEFER", availabilityStage: "REFERENCE_LOCATORS_ONLY", integrationForm: "block copy/adaptation until license is resolved" }],
  ["tt-a1i/archify", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "IMPORT_CANDIDATE", availabilityStage: "PROPOSAL_NEXT", integrationForm: "proposal/pointer candidate for deterministic diagram artifacts" }],
  ["zhaoxuya520/reverse-skill", { licenseState: "LICENSE_OK_FOR_ADAPTATION", queueState: "NEEDS_MODIFICATION", availabilityStage: "SAFETY_GATED_STATIC_SOURCE", integrationForm: "authorized-security/sandbox-gated router structure only" }]
]);

function usage() {
  return [
    "Usage: node scripts/starred-availability.mjs --from-file <starred-classified.json> --out <registry.json> [--markdown <registry.md>] [--generated-at <iso>]",
    "",
    "Builds a machine-readable availability registry for GitHub starred repositories.",
    "Input should be the JSON output of scripts/starred-repo-intake.mjs.",
    "No target repository code is executed."
  ].join("\n");
}

function parseArgs(argv) {
  const args = { fromFile: "", out: "", markdown: "", generatedAt: DETERMINISTIC_TIMESTAMP };
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (flag === "--help" || flag === "-h") {
      process.stdout.write(`${usage()}\n`);
      process.exit(0);
    }
    if (!value) throw new Error(usage());
    if (flag === "--from-file") args.fromFile = value;
    else if (flag === "--out") args.out = value;
    else if (flag === "--markdown") args.markdown = value;
    else if (flag === "--generated-at") args.generatedAt = value;
    else throw new Error(`Unknown argument: ${flag}\n${usage()}`);
  }
  if (!args.fromFile || !args.out) throw new Error(usage());
  return args;
}

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function repoRecord(record) {
  const design = DIRECT_DESIGN.get(record.fullName);
  const fullName = record.fullName;
  const [owner, name] = fullName.split("/");
  const htmlUrl = record.htmlUrl ?? `https://github.com/${fullName}`;
  const defaultBranch = record.defaultBranch ?? "HEAD";
  return {
    fullName,
    owner,
    name,
    source: "authenticated-github-stars",
    relevanceBand: record.relevanceBand,
    description: record.description ?? "",
    language: record.language ?? "UNKNOWN",
    licenseSpdx: record.licenseSpdx ?? "NOASSERTION",
    licenseState: design?.licenseState ?? record.licenseState ?? "LICENSE_UNKNOWN",
    queueState: design?.queueState ?? "NOT_EVALUATED",
    availabilityStage: design?.availabilityStage ?? "SOURCE_LOCATORS_AVAILABLE",
    integrationForm: design?.integrationForm ?? "metadata/static source locator; no import decision yet",
    defaultBranch,
    pushedAt: record.pushedAt ?? null,
    archived: Boolean(record.archived),
    fork: Boolean(record.fork),
    accessStates: record.accessStates ?? [],
    sessionUse: record.sessionUse ?? [],
    locators: {
      html: htmlUrl,
      git: `${htmlUrl}.git`,
      contentsApi: `https://api.github.com/repos/${fullName}/contents?ref=${encodeURIComponent(defaultBranch)}`,
      archive: `https://github.com/${fullName}/archive/${encodeURIComponent(defaultBranch)}.zip`,
      quarantinePath: design ? `quarantine/starred-2026-09-02/${owner}__${name}` : null
    },
    noExecStatus: "INTAKE_POLICY_NO_TARGET_CODE_EXECUTION",
    evidence: [
      "docs/starred-repo-intake.md",
      "docs/direct-overlap-import-design.md",
      "scripts/starred-repo-intake.mjs"
    ]
  };
}

function markdown(registry) {
  return [
    "# Starred Repository Availability Registry",
    "",
    `Generated at: ${registry.generatedAt}`,
    "",
    "This registry begins making the user's GitHub starred repositories available to ToolsForCodex as tracked source-locator records. It does not yet plug those records into the main source-record/catalog loader, vendor repository contents, run target code, or imply import approval.",
    "",
    `- Repositories: ${registry.summary.total}`,
    `- Direct overlap: ${registry.summary.directOverlap}`,
    `- Import candidates begun: ${registry.summary.importCandidates}`,
    `- Needs modification: ${registry.summary.needsModification}`,
    `- License blocked/unknown/review: ${registry.summary.licenseConstrained}`,
    "",
    "| Repository | Availability | Queue | License | Integration form |",
    "| --- | --- | --- | --- | --- |",
    ...registry.repositories.map((repo) => `| \`${repo.fullName}\` | ${repo.availabilityStage} | ${repo.queueState} | ${repo.licenseState} | ${repo.integrationForm.replaceAll("|", "\\|")} |`),
    "",
    "## No-exec boundary",
    "",
    "The registry contains source locators and decisions only. Target repository installs, tests, package scripts, hooks, notebooks, binaries, containers, and services remain unauthorized during intake. The no-exec status is an intake policy assertion from the captured workflow, not a derived property of arbitrary input files.",
    ""
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = JSON.parse(await readFile(args.fromFile, "utf8"));
  if (!Array.isArray(input.records)) throw new Error("Input must contain a records array from starred-repo-intake.");
  const repositories = input.records.map(repoRecord).sort((left, right) => left.fullName.localeCompare(right.fullName));
  const summary = {
    total: repositories.length,
    directOverlap: repositories.filter((repo) => repo.relevanceBand === "DIRECT_TOOLSFORCODEX_OVERLAP").length,
    importCandidates: repositories.filter((repo) => repo.queueState === "IMPORT_CANDIDATE").length,
    needsModification: repositories.filter((repo) => repo.queueState === "NEEDS_MODIFICATION").length,
    licenseConstrained: repositories.filter((repo) => /BLOCKED|UNKNOWN|NEEDS_REVIEW/.test(repo.licenseState)).length
  };
  const unsigned = {
    schemaVersion: "1.0",
    id: "github-starred-source-availability",
    generatedAt: args.generatedAt,
    source: {
      kind: "authenticated-github-stars",
      input: args.fromFile,
      intakeCount: input.count,
      intakeGeneratedAt: input.generatedAt
    },
    summary,
    repositories
  };
  const registry = { ...unsigned, digest: digest(unsigned) };
  await mkdir(dirname(resolve(args.out)), { recursive: true });
  await writeFile(args.out, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  if (args.markdown) {
    await mkdir(dirname(resolve(args.markdown)), { recursive: true });
    await writeFile(args.markdown, markdown(registry), "utf8");
  }
  process.stdout.write(`${JSON.stringify({ status: "VERIFIED", out: args.out, markdown: args.markdown || null, summary, digest: registry.digest }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${JSON.stringify({ status: "INVALID", error: error instanceof Error ? error.message : String(error) })}\n`);
  process.exitCode = 1;
});
