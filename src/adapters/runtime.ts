import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import type { Runtime } from "../config/types";
import type { SkillIr } from "../domain/skill-ir";
import { sha256, stableStringify, writeJson } from "../utils/files";

export interface AdapterResult { readonly runtime: Runtime; readonly generatedPath: string; readonly supportedCapabilities: readonly string[]; readonly unsupportedCapabilities: readonly string[]; readonly status: "VERIFIED" | "WARNING" | "BLOCKED"; readonly skillDigest: string }
const capabilities: Record<Runtime, readonly string[]> = {
  codex: ["file-read", "portable-instructions", "user-invocation", "model-invocation"],
  claude: ["file-read", "portable-instructions", "user-invocation", "model-invocation"],
  gemini: ["file-read", "portable-instructions", "user-invocation", "model-invocation"],
  "generic-agents": ["file-read", "portable-instructions"]
};

export function compileAdapter(runtime: Runtime, skills: readonly SkillIr[], outputRoot: string): AdapterResult {
  const supported = capabilities[runtime];
  const required = [...new Set(skills.flatMap((skill) => skill.runtimeCapabilityRequirements))];
  const unsupported = required.filter((capability) => !supported.includes(capability));
  const status = unsupported.length > 0 ? "WARNING" : "VERIFIED";
  const generatedPath = join(outputRoot, runtime, "skills");
  mkdirSync(generatedPath, { recursive: true });
  for (const skill of skills) {
    const directory = join(generatedPath, skill.name);
    mkdirSync(join(directory, "agents"), { recursive: true });
    const restrictions = skill.invocationMode === "user" ? "disable-model-invocation: true" : "disable-model-invocation: false";
    const description = skill.invocationMode === "model" ? `description: Generated adapter for ${skill.name} when compatibility validation is requested.` : `description: Generated portable adapter for ${skill.name}.`;
    writeFileSync(join(directory, "SKILL.md"), [`---`, `name: ${skill.name}`, description, restrictions, `---`, ``, skill.portableInstructions, ``].join("\n"), "utf8");
    writeFileSync(join(directory, "agents", "openai.yaml"), [`interface:`, `  display_name: ${skill.name}`, `  short_description: Generated portable adapter for ${skill.name}.`, `policy:`, `  allow_implicit_invocation: ${skill.invocationMode === "model"}` , ``].join("\n"), "utf8");
  }
  const skillDigest = sha256(stableStringify(skills.map((skill) => ({ name: skill.name, invocationMode: skill.invocationMode, dependencies: skill.dependencies, portableInstructions: skill.portableInstructions }))));
  return { runtime, generatedPath, supportedCapabilities: supported, unsupportedCapabilities: unsupported, status, skillDigest };
}

export function writeRuntimeEquivalence(runtimes: readonly Runtime[], skills: readonly SkillIr[], outputRoot: string): { readonly status: "VERIFIED" | "WARNING" | "BLOCKED"; readonly adapters: readonly AdapterResult[]; readonly differences: readonly string[] } {
  const adapters = runtimes.map((runtime) => compileAdapter(runtime, skills, outputRoot));
  const differences = adapters.filter((adapter) => adapter.skillDigest !== adapters[0]?.skillDigest).map((adapter) => `${adapter.runtime}: skill digest differs`);
  const status = differences.length > 0 ? "BLOCKED" : adapters.some((adapter) => adapter.status === "WARNING") ? "WARNING" : "VERIFIED";
  const result = { schemaVersion: "1.0", status, adapters, differences, skills: skills.map((skill) => ({ name: skill.name, invocationMode: skill.invocationMode, dependencies: skill.dependencies, instructionsDigest: sha256(skill.portableInstructions), securityBoundary: "read-only-until-approved-transaction" })) };
  writeJson(join(outputRoot, "runtime-equivalence.json"), result);
  return { status, adapters, differences };
}
