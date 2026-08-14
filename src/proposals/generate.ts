import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import type { OrchestratorConfig } from "../config/types";
import type { CatalogResult, DiscoveredRecord } from "../domain/records";
import type { StandardizationResult } from "../normalization/skill-normalizer";
import { discover } from "../discovery/walker";
import { sha256, stableStringify, writeJson } from "../utils/files";

export type ProposedComponentKind = "skill" | "plugin" | "workflow" | "agent" | "script" | "documentation" | "configuration" | "other";
export type ProposalConfidence = "high" | "medium" | "low";

export interface ProposedComponent {
  readonly kind: ProposedComponentKind;
  readonly name: string;
  readonly path: string;
  readonly purpose: string;
  readonly invocationMode?: "user" | "model" | "unknown";
  readonly confidence: ProposalConfidence;
  readonly evidence: readonly string[];
}

export interface ProposedFile {
  readonly path: string;
  readonly kind: "coordinator" | "index" | "metadata" | "manifest";
  readonly content: string;
  readonly evidence: readonly string[];
}

export interface ProposalResult {
  readonly schemaVersion: "1.0";
  readonly status: "PROPOSED" | "BLOCKED";
  readonly targetPath: ".";
  readonly sourceDigest: string;
  readonly components: readonly ProposedComponent[];
  readonly coordinator: { readonly paths: readonly string[]; readonly files: readonly string[] };
  readonly indexes: readonly string[];
  readonly files: readonly ProposedFile[];
  readonly limitations: readonly string[];
  readonly digest: string;
}

function frontmatter(markdown: string): { readonly name?: string; readonly description?: string; readonly invocationMode: "user" | "model" | "unknown" } {
  const block = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const values = new Map<string, string>();
  for (const line of block?.[1]?.split(/\r?\n/) ?? []) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/);
    if (match?.[1] && match[2] !== undefined) values.set(match[1], match[2].replace(/^['"]|['"]$/g, ""));
  }
  const disabled = values.get("disable-model-invocation");
  const result: { name?: string; description?: string; invocationMode: "user" | "model" | "unknown" } = { invocationMode: disabled === "true" ? "user" : disabled === "false" ? "model" : "unknown" };
  const name = values.get("name");
  const description = values.get("description");
  if (name) result.name = name;
  if (description) result.description = description;
  return result;
}

function category(record: DiscoveredRecord): ProposedComponentKind {
  const path = record.path.toLowerCase();
  if (/(^|\/)skill\.md$/.test(path)) return "skill";
  if (/(^|\/)\.[a-z0-9-]+-plugin(\/|$)|(^|\/)plugins?(\/|$)|(^|\/)plugin(\.json|\/)/.test(path)) return "plugin";
  if (/(^|\/)\.github\/(workflows|actions)\//.test(path) || /(^|\/)workflows?\//.test(path)) return "workflow";
  if (/(^|\/)(agents?|AGENTS\.md|CLAUDE\.md|GEMINI\.md)(\/|$)/i.test(record.path) || /(^|\/)agent/i.test(path)) return "agent";
  if (/(^|\/)(scripts?|bin|tools)\//.test(path) || /\.(sh|bash|ps1|bat|cmd)$/.test(path)) return "script";
  if (/(^|\/)(readme|docs?)(\.|\/|$)/.test(path) || /\.(md|mdx|rst|txt)$/.test(path)) return "documentation";
  if (/(^|\/)(package\.json|tsconfig[^/]*\.json|pyproject\.toml|cargo\.toml|makefile|dockerfile|.*\.config\.(json|js|ts)|\.env\.)$/.test(path) || /(^|\/)(config|settings)\//.test(path)) return "configuration";
  return "other";
}

function skillDetails(record: DiscoveredRecord): { readonly name: string; readonly purpose: string; readonly invocationMode: "user" | "model" | "unknown"; readonly confidence: ProposalConfidence } {
  const details = frontmatter(record.content ?? "");
  const fallback = basename(dirname(record.path));
  return { name: details.name ?? fallback, purpose: details.description ?? `Skill instructions observed at ${record.path}`, invocationMode: details.invocationMode, confidence: details.name && details.description ? "high" : "medium" };
}

function componentFor(record: DiscoveredRecord): ProposedComponent {
  const kind = category(record);
  if (kind === "skill") {
    const details = skillDetails(record);
    return { kind, name: details.name, path: record.path, purpose: details.purpose, invocationMode: details.invocationMode, confidence: details.confidence, evidence: [record.path] };
  }
  const name = record.path.split("/").pop() ?? record.path;
  const purposes: Record<ProposedComponentKind, string> = { skill: "Skill instructions", plugin: "Plugin entry or plugin configuration", workflow: "Automated workflow or repository action", agent: "Agent instructions or agent metadata", script: "Supporting executable or automation script", documentation: "Repository documentation", configuration: "Repository configuration", other: "Observed repository asset" };
  return { kind, name, path: record.path, purpose: purposes[kind], confidence: kind === "other" ? "low" : "medium", evidence: [record.path] };
}

function groupedComponents(components: readonly ProposedComponent[], kind: ProposedComponentKind): readonly ProposedComponent[] { return components.filter((component) => component.kind === kind).sort((a, b) => a.path.localeCompare(b.path)); }

function skillRoot(path: string): string | undefined {
  const segments = path.split("/");
  const index = segments.indexOf("skills");
  return index < 0 ? undefined : segments.slice(0, index + 1).join("/");
}

function primarySkillRoot(components: readonly ProposedComponent[]): string {
  const counts = new Map<string, number>();
  for (const skill of groupedComponents(components, "skill")) { const root = skillRoot(skill.path); if (root) counts.set(root, (counts.get(root) ?? 0) + 1); }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] === "skills" ? -1 : b[0] === "skills" ? 1 : a[0].localeCompare(b[0])))[0]?.[0] ?? "skills";
}

function skillBucket(path: string, root: string): string {
  const remainder = path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;
  return remainder.split("/")[0] || "misc";
}

function indexContent(components: readonly ProposedComponent[], sourceDigest: string): string {
  const headings: readonly ProposedComponentKind[] = ["skill", "plugin", "workflow", "agent", "script", "documentation", "configuration", "other"];
  return [`# Proposed file index`, ``, `This index was generated from observed repository contents. It is a proposal, not an applied change.`, ``, `Source digest: \`${sourceDigest}\``, ``, ...headings.flatMap((kind) => { const entries = groupedComponents(components, kind); return entries.length ? [`## ${kind.charAt(0).toUpperCase()}${kind.slice(1)}s`, ``, ...entries.map((entry) => `- \`${entry.path}\` — ${entry.purpose} [${entry.confidence} confidence]`), ``] : []; }), ``].join("\n");
}

function skillsIndex(components: readonly ProposedComponent[], sourceDigest: string): string {
  const skills = groupedComponents(components, "skill");
  return [`# Proposed skills index`, ``, `Generated from observed SKILL.md files. Review names and descriptions before applying.`, ``, `Source digest: \`${sourceDigest}\``, ``, ...(skills.length ? skills.map((skill) => `- \`/${skill.name}\` — \`${skill.path}\` — ${skill.purpose}`) : ["- No SKILL.md files were observed."]), ``].join("\n");
}

function coordinatorContent(components: readonly ProposedComponent[], sourceDigest: string): string {
  const skills = groupedComponents(components, "skill");
  const workflows = groupedComponents(components, "workflow");
  const plugins = groupedComponents(components, "plugin");
  return [`# Proposed repository coordinator`, ``, `This coordinator was generated from the files currently present in the repository. It is a reviewable proposal and has not been installed.`, ``, `## How to use it`, ``, `1. Read \`INDEX.md\` and \`skills/INDEX.md\` before selecting a component.`, `2. Choose the smallest skill whose observed description matches the user's request.`, `3. Follow that skill's own instructions and use the observed scripts and workflows only when they are relevant.`, `4. Pass the skill's output to the next step only when the output is present and validated.`, `5. Stop and ask for review when a needed file, dependency, permission, or expected output is missing.`, ``, `## Observed skills`, ``, ...(skills.length ? skills.map((skill) => `- /${skill.name} — ${skill.purpose} (${skill.invocationMode}-invoked)`) : ["- None observed."]), ``, `## Observed plugins`, ``, ...(plugins.length ? plugins.map((plugin) => `- ${plugin.path}`) : ["- None observed."]), ``, `## Observed workflows`, ``, ...(workflows.length ? workflows.map((workflow) => `- ${workflow.path}`) : ["- None observed."]), ``, `## Safety and limits`, ``, `- Do not claim an inferred purpose is confirmed behavior.`, `- Do not run an observed script merely because it exists; confirm that it is needed and safe first.`, `- Do not install plugins, change global settings, or modify source files without explicit approval.`, `- Record missing metadata and unresolved connections as review items.`, ``, `Evidence digest: \`${sourceDigest}\``, ``].join("\n");
}

function routerSkillContent(coordinator: string): string {
  return [`---`, `name: production-orchestrator`, `description: Route repository work using the observed skills and workflows after review.`, `disable-model-invocation: true`, `---`, ``, coordinator].join("\n");
}

function metadataContent(): string { return [`interface:`, `  display_name: Proposed Repository Coordinator`, `  short_description: Route repository work using reviewed local skills and workflows.`, `policy:`, `  allow_implicit_invocation: false`, ``].join("\n"); }

function distributionManifest(components: readonly ProposedComponent[]): string {
  const skills = [...new Set(["production-orchestrator", ...groupedComponents(components, "skill").map((skill) => skill.name)])].sort();
  return `${JSON.stringify({ schemaVersion: "1.0", mode: "skills-sh-editable", skills, scope: "project-local", approvalRequired: true, status: "PROPOSED" }, null, 2)}\n`;
}

export function generateProposal(targetRoot: string, catalog: CatalogResult, plan: StandardizationResult, auditIgnore: readonly string[] = []): ProposalResult {
  const records = discover(targetRoot, auditIgnore).records.filter((record) => record.kind === "file");
  const components = records.map(componentFor).sort((a, b) => a.path.localeCompare(b.path));
  const sourceDigest = catalog.overallDigest;
  const coordinatorText = coordinatorContent(components, sourceDigest);
  const selectedSkillRoot = primarySkillRoot(components);
  const hasSkillsDirectory = groupedComponents(components, "skill").length > 0;
  const buckets = [...new Set(groupedComponents(components, "skill").filter((skill) => skillRoot(skill.path) === selectedSkillRoot).map((skill) => skillBucket(skill.path, selectedSkillRoot)).filter((value) => value !== "production-orchestrator"))].sort();
  const files: ProposedFile[] = [
    { path: "AGENTS.md", kind: "coordinator", content: coordinatorText, evidence: components.slice(0, 20).map((component) => component.path) },
    { path: "INDEX.md", kind: "index", content: indexContent(components, sourceDigest), evidence: components.map((component) => component.path) },
    { path: hasSkillsDirectory ? `${selectedSkillRoot}/INDEX.md` : "INDEX.md", kind: "index", content: skillsIndex(components, sourceDigest), evidence: groupedComponents(components, "skill").map((skill) => skill.path) },
    { path: `${selectedSkillRoot}/distribution-manifest.json`, kind: "manifest", content: distributionManifest(components), evidence: groupedComponents(components, "skill").map((skill) => skill.path) }
  ];
  if (hasSkillsDirectory) {
    files.push({ path: `${selectedSkillRoot}/production-orchestrator/SKILL.md`, kind: "coordinator", content: routerSkillContent(coordinatorText), evidence: ["AGENTS.md", `${selectedSkillRoot}/INDEX.md`] });
    files.push({ path: `${selectedSkillRoot}/production-orchestrator/agents/openai.yaml`, kind: "metadata", content: metadataContent(), evidence: [`${selectedSkillRoot}/production-orchestrator/SKILL.md`] });
    for (const bucket of buckets) { const bucketSkills = groupedComponents(components, "skill").filter((skill) => skillRoot(skill.path) === selectedSkillRoot && skillBucket(skill.path, selectedSkillRoot) === bucket); files.push({ path: `${selectedSkillRoot}/${bucket}/INDEX.md`, kind: "index", content: skillsIndex(bucketSkills, sourceDigest), evidence: bucketSkills.map((skill) => skill.path) }); }
  }
  const limitations = ["Generated from observed paths and readable frontmatter; inferred purposes require human review.", "Existing skill metadata, dependencies, and instructions were not rewritten by this proposal.", "The proposal is stored under .orchestrator/proposals and has not been copied into the repository.", ...(plan.status === "BLOCKED" ? [`The standardization plan is BLOCKED by ${plan.candidates.filter((candidate) => candidate.status === "BLOCKED").length} skill candidate(s) or dependency findings.`] : [])];
  const status: ProposalResult["status"] = components.length === 0 ? "BLOCKED" : "PROPOSED";
  const unsigned = { schemaVersion: "1.0" as const, status, targetPath: "." as const, sourceDigest, components, coordinator: { paths: hasSkillsDirectory ? ["AGENTS.md", `${selectedSkillRoot}/production-orchestrator/SKILL.md`] : ["AGENTS.md"], files: files.filter((file) => file.kind === "coordinator").map((file) => file.path) }, indexes: files.filter((file) => file.kind === "index" || file.kind === "manifest").map((file) => file.path), files, limitations };
  return { ...unsigned, digest: sha256(stableStringify(unsigned)) };
}

export function writeProposalOutputs(targetRoot: string, config: OrchestratorConfig, catalog: CatalogResult, plan: StandardizationResult): ProposalResult {
  const result = generateProposal(targetRoot, catalog, plan, config.auditIgnore);
  const output = resolve(targetRoot, config.outputDirectory, "proposals");
  mkdirSync(join(output, "files"), { recursive: true });
  writeJson(join(output, "proposal.json"), result);
  writeFileSync(join(output, "proposal-report.md"), [`# Proposal report`, ``, `Status: **${result.status}**`, ``, `This report proposes a coordinator and file indexes from observed repository contents. Nothing was applied.`, ``, `- Components: **${result.components.length}**`, `- Coordinator files: **${result.coordinator.files.length}**`, `- Index and manifest files: **${result.indexes.length}**`, `- Source digest: \`${result.sourceDigest}\``, `- Proposal digest: \`${result.digest}\``, ``, `## Proposed components`, ``, ...result.components.map((component) => `- **${component.kind}** \`${component.name}\` — \`${component.path}\` — ${component.purpose} (${component.confidence} confidence)`), ``, `## Limitations`, ``, ...result.limitations.map((limitation) => `- ${limitation}`), ``].join("\n"), "utf8");
  for (const file of result.files) { const destination = join(output, "files", file.path); mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, file.content, "utf8"); }
  return result;
}
