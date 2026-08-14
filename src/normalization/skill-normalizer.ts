import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { sha256, stableStringify, writeJson } from "../utils/files";
import { readSkillMetadata } from "../validation/skill-metadata";
import { analyzeDependencies } from "./dependency-graph";
import { resolveStyleContract } from "./style-contract";
import type { SkillIr, InvocationMode, LifecycleBucket, DistributionMode } from "../domain/skill-ir";

export const COMPATIBILITY_PROFILE = { name: "matt-pocock-compatible-v1", upstreamRepository: "https://github.com/mattpocock/skills", retrievedAt: "2026-08-14T00:00:00.000Z", sourceRevision: "local-contract-v1" } as const;

export interface PatchOperation { readonly path: string; readonly originalHash: string; readonly replacementHash: string; readonly ruleId: string; readonly sourceLocator: string; readonly confidence: "high" | "medium" | "low"; readonly requiresHumanReview: boolean; readonly replacement: string }
export interface SkillCandidate { readonly skill: SkillIr; readonly path: string; readonly status: "VERIFIED" | "WARNING" | "BLOCKED"; readonly failedRules: readonly string[]; readonly reviewQuestions: readonly string[]; readonly operations: readonly PatchOperation[] }
export interface StandardizationResult { readonly schemaVersion: "1.0"; readonly profile: typeof COMPATIBILITY_PROFILE; readonly status: "VERIFIED" | "WARNING" | "BLOCKED"; readonly candidates: readonly SkillCandidate[]; readonly graph: ReturnType<typeof analyzeDependencies>; readonly styleContract: ReturnType<typeof resolveStyleContract>; readonly digest: string }

function lifecycle(path: string): LifecycleBucket {
  const bucket = path.split("/")[1] as LifecycleBucket | undefined;
  return ["engineering", "productivity", "misc", "in-progress", "deprecated"].includes(bucket ?? "") ? bucket as LifecycleBucket : "misc";
}

function invocation(disabled: boolean): InvocationMode { return disabled ? "user" : "model"; }
function distribution(value: string | undefined): DistributionMode { return value === "claude-plugin" || value === "skills-sh-editable" || value === "skillshare-approved-sync" ? value : "skills-sh-editable"; }
function findSkillDirectories(root: string): string[] {
  const skillsRoot = join(root, "skills");
  if (!existsSync(skillsRoot)) return [];
  const result: string[] = [];
  function walk(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name === "SKILL.md") result.push(dirname(full));
    }
  }
  walk(skillsRoot);
  return result.sort();
}

function toIr(root: string, directory: string, mode: string | undefined): { ir: SkillIr; markdown: string; path: string } {
  const markdownPath = join(directory, "SKILL.md");
  const metadata = readSkillMetadata(markdownPath, join(directory, "agents", "openai.yaml"));
  const markdown = readFileSync(markdownPath, "utf8");
  const relativePath = relative(root, markdownPath).replaceAll("\\", "/");
  const dependencies = [...markdown.matchAll(/(^|\s)\/(\b[a-z0-9]+(?:-[a-z0-9]+)*)/gi)].map((match) => `/${match[2]}` as `/${string}`);
  const references = [...markdown.matchAll(/(?:references|docs|templates)\/[A-Za-z0-9._/-]+/g)].map((match) => match[0]);
  const ir: SkillIr = { name: metadata.name, invocationMode: invocation(metadata.userInvoked), lifecycleBucket: lifecycle(relativePath), portableInstructions: markdown.replace(/^---[\s\S]*?---\s*/m, "").trim(), declaredInputs: [], declaredOutputs: [], dependencies: [...new Set(dependencies)], ownedReferenceFiles: [...new Set(references)], runtimeCapabilityRequirements: ["file-read"], sourceHash: sha256(markdown), reviewState: "reviewed", distributionMode: distribution(mode) };
  return { ir, markdown, path: relativePath };
}

export function normalizeSkills(root: string, distributionMode?: string): StandardizationResult {
  const candidates: SkillCandidate[] = [];
  for (const directory of findSkillDirectories(root)) {
    const path = relative(root, directory).replaceAll("\\", "/");
    const failed: string[] = [];
    const reviewQuestions: string[] = [];
    let ir: SkillIr;
    let markdown = "";
    try { ({ ir, markdown } = toIr(root, directory, distributionMode)); }
    catch (error) {
      candidates.push({ skill: { name: path.split("/").pop() ?? "unknown", invocationMode: "model", lifecycleBucket: lifecycle(path), portableInstructions: "", declaredInputs: [], declaredOutputs: [], dependencies: [], ownedReferenceFiles: [], runtimeCapabilityRequirements: [], sourceHash: "0".repeat(64), reviewState: "blocked", distributionMode: distribution(distributionMode) }, path, status: "BLOCKED", failedRules: ["metadata-valid"], reviewQuestions: [error instanceof Error ? error.message : "UNKNOWN"], operations: [] });
      continue;
    }
    if (ir.invocationMode === "user" && /\b(when|if|use for|trigger)\b/i.test(`${readFileSync(join(directory, "SKILL.md"), "utf8").match(/^description:\s*(.+)$/m)?.[1] ?? ""}`)) failed.push("human-description-audience");
    if (ir.invocationMode === "model" && !/\b(when|validating|audit|invoked)\b/i.test(markdown.split("\n")[2] ?? "")) failed.push("model-description-trigger");
    if (/skills[\\/]|\.\.[\\/]/i.test(markdown)) failed.push("cross-skill-relative-reference");
    if (!existsSync(join(directory, "agents", "openai.yaml"))) failed.push("openai-metadata-present");
    const operations: PatchOperation[] = [];
    candidates.push({ skill: ir, path, status: failed.length > 0 ? "BLOCKED" : reviewQuestions.length > 0 ? "WARNING" : "VERIFIED", failedRules: failed, reviewQuestions, operations });
  }
  const graph = analyzeDependencies(candidates.map((candidate) => candidate.skill));
  const styleContract = resolveStyleContract(root);
  const graphFailures = [...(graph.missing.length ? ["missing-dependency"] : []), ...(graph.cycles.length ? ["dependency-cycle"] : []), ...(graph.userToUser.length ? ["user-to-user-dependency"] : [])];
  const finalCandidates = candidates.map((candidate) => ({ ...candidate, status: graphFailures.length > 0 || candidate.failedRules.length > 0 ? "BLOCKED" as const : candidate.status, failedRules: [...candidate.failedRules, ...graphFailures] }));
  const status = finalCandidates.some((candidate) => candidate.status === "BLOCKED") || styleContract.status === "BLOCKED" ? "BLOCKED" : finalCandidates.some((candidate) => candidate.status === "WARNING") || styleContract.status === "UNKNOWN" ? "WARNING" : "VERIFIED";
  const digest = sha256(stableStringify({ profile: COMPATIBILITY_PROFILE, candidates: finalCandidates, graph, styleContract }));
  return { schemaVersion: "1.0", profile: COMPATIBILITY_PROFILE, status, candidates: finalCandidates, graph, styleContract, digest };
}

export function writeStandardizationOutputs(targetRoot: string, outputDirectory: string, distributionMode?: string): StandardizationResult {
  const result = normalizeSkills(targetRoot, distributionMode);
  const output = join(targetRoot, outputDirectory, "standardization");
  mkdirSync(join(output, "patches"), { recursive: true });
  writeJson(join(output, "standardization-plan.json"), result);
  writeFileSync(join(output, "standardization-report.md"), [`# Standardization report`, ``, `Status: **${result.status}**`, `Profile: \`${result.profile.name}\` @ \`${result.profile.sourceRevision}\``, `Digest: \`${result.digest}\``, ``, ...result.candidates.map((candidate) => `- \`${candidate.path}\`: **${candidate.status}**${candidate.failedRules.length ? ` — ${candidate.failedRules.join(", ")}` : ""}`), ``].join("\n"), "utf8");
  for (const candidate of result.candidates) for (const operation of candidate.operations) writeJson(join(output, "patches", `${sha256(operation.path).slice(0, 12)}.json`), operation);
  return result;
}
