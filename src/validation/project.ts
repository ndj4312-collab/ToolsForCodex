import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readSkillMetadata, validateSkillMetadata } from "./skill-metadata";
import type { OrchestratorConfig } from "../config/types";

export interface ProjectFinding { readonly status: "VERIFIED" | "WARNING" | "BLOCKED" | "UNKNOWN"; readonly ruleId: string; readonly path: string; readonly message: string }
function skillDirectories(root: string): string[] {
  const result: string[] = [];
  const skillsRoot = join(root, "skills");
  if (!existsSync(skillsRoot)) return result;
  function walk(dir: string): void { for (const entry of readdirSync(dir, { withFileTypes: true })) { const path = join(dir, entry.name); if (entry.isDirectory()) walk(path); else if (entry.name === "SKILL.md") result.push(join(dir)); } }
  walk(skillsRoot); return result.sort();
}
export function validateProject(root: string, config?: OrchestratorConfig): readonly ProjectFinding[] {
  const findings: ProjectFinding[] = [];
  const skills = skillDirectories(root);
  const names: string[] = [];
  for (const directory of skills) {
    const markdown = join(directory, "SKILL.md");
    const metadataPath = join(directory, "agents", "openai.yaml");
    const relativePath = markdown.slice(root.length + 1).replaceAll("\\", "/");
    if (!existsSync(metadataPath)) { findings.push({ status: "BLOCKED", ruleId: "metadata-present", path: relativePath, message: "agents/openai.yaml is missing" }); continue; }
    try {
      const metadata = readSkillMetadata(markdown, metadataPath); names.push(metadata.name); const errors = validateSkillMetadata(metadata); for (const message of errors) findings.push({ status: "BLOCKED", ruleId: "metadata-parity", path: relativePath, message });
      if (!/^---\r?\n[\s\S]*\r?\n---\r?\n/.test(readFileSync(markdown, "utf8"))) findings.push({ status: "BLOCKED", ruleId: "frontmatter", path: relativePath, message: "SKILL.md lacks a complete frontmatter block" });
    } catch (error) { findings.push({ status: "BLOCKED", ruleId: "metadata-valid", path: relativePath, message: error instanceof Error ? error.message : "UNKNOWN" }); }
  }
  const router = join(root, "skills", "production-orchestrator", "SKILL.md");
  if (!existsSync(router)) findings.push({ status: "BLOCKED", ruleId: "router-present", path: "skills/production-orchestrator/SKILL.md", message: "Explicit router skill is missing" });
  else for (const name of names) if (!readFileSync(router, "utf8").includes(`/${name}`) && name !== "production-orchestrator") findings.push({ status: "BLOCKED", ruleId: "router-consistency", path: "skills/production-orchestrator/SKILL.md", message: `Router does not enumerate /${name}` });
  const distributionManifest = join(root, "skills", "distribution-manifest.json");
  if (!existsSync(distributionManifest)) findings.push({ status: "BLOCKED", ruleId: "distribution-manifest", path: "skills/distribution-manifest.json", message: "Declared distribution manifest is missing" });
  else {
    try { const manifest = JSON.parse(readFileSync(distributionManifest, "utf8")) as { mode?: string; skills?: unknown[] }; if (!manifest.mode || !["claude-plugin", "skills-sh-editable", "skillshare-approved-sync"].includes(manifest.mode)) findings.push({ status: "BLOCKED", ruleId: "distribution-route", path: "skills/distribution-manifest.json", message: "Manifest must select exactly one supported route" }); for (const name of names) if (!manifest.skills?.includes(name)) findings.push({ status: "BLOCKED", ruleId: "distribution-manifest", path: "skills/distribution-manifest.json", message: `Manifest omits ${name}` }); }
    catch (error) { findings.push({ status: "BLOCKED", ruleId: "distribution-manifest", path: "skills/distribution-manifest.json", message: error instanceof Error ? error.message : "UNKNOWN" }); }
  }
  for (const directory of skills) {
    const rel = directory.slice(join(root, "skills").length + 1).replaceAll("\\", "/"); const [bucket, name] = rel.split("/");
    if (bucket !== "engineering" && bucket !== "productivity") continue;
    const bucketIndex = join(root, "skills", bucket, "INDEX.md"); const doc = join(root, "docs", bucket, `${name}.md`);
    if (!existsSync(bucketIndex)) findings.push({ status: "BLOCKED", ruleId: "bucket-index", path: bucketIndex.slice(root.length + 1), message: "Promoted bucket index is missing" });
    if (!existsSync(doc)) findings.push({ status: "BLOCKED", ruleId: "public-documentation", path: doc.slice(root.length + 1), message: "Promoted skill documentation is missing" });
    else { const text = readFileSync(doc, "utf8"); for (const heading of ["What it does", "When to reach for it", "Common questions", "It's working if"]) if (!text.includes(`## ${heading}`)) findings.push({ status: "BLOCKED", ruleId: "documentation-headings", path: doc.slice(root.length + 1), message: `Missing heading: ${heading}` }); }
  }
  if (config && !config.distributionMode) findings.push({ status: "BLOCKED", ruleId: "distribution-route", path: "orchestrator.config.json", message: "Exactly one distributionMode must be selected before bootstrap or install" });
  return findings.length === 0 ? [{ status: "VERIFIED", ruleId: "project-contract", path: ".", message: "Project structure and skill contracts are consistent" }] : findings;
}
