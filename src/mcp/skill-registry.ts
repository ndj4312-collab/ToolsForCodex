import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";

export type SkillMatch = {
  name: string;
  description: string;
  path: string;
};

export type LoadedSkill = SkillMatch & {
  content: string;
};

const SKILL_FILE = "SKILL.md";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const SKIP_DIRS = new Set([".git", ".orchestrator", ".work", "dist", "node_modules", "quarantine"]);

function asProjectPath(root: string, path: string): string {
  return relative(root, path).split(sep).join("/");
}

function isInside(root: string, path: string): boolean {
  const rel = relative(root, path);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function parseFrontmatter(content: string): { name: string | undefined; description: string } {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(content);
  if (!match) return { name: undefined, description: "" };
  const metadata = match[1] ?? "";
  const values = new Map<string, string>();
  for (const line of metadata.split("\n")) {
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (field) values.set(field[1]!, field[2]!.replace(/^["']|["']$/g, ""));
  }
  return { name: values.get("name"), description: values.get("description") ?? "" };
}

function walk(root: string, dir: string, skills: SkillMatch[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(root, fullPath, skills);
      continue;
    }
    if (!entry.isFile() || entry.name !== SKILL_FILE) continue;
    const content = readFileSync(fullPath, "utf8");
    const metadata = parseFrontmatter(content);
    skills.push({
      name: metadata.name ?? basename(resolve(fullPath, "..")),
      description: metadata.description,
      path: asProjectPath(root, fullPath),
    });
  }
}

export function listProjectSkills(root: string): SkillMatch[] {
  const projectRoot = resolve(root);
  const skillsRoot = join(projectRoot, "skills");
  if (!existsSync(skillsRoot) || !statSync(skillsRoot).isDirectory()) return [];
  const skills: SkillMatch[] = [];
  walk(projectRoot, skillsRoot, skills);
  return skills.sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
}

export function findProjectSkills(root: string, query = "", limit = DEFAULT_LIMIT): SkillMatch[] {
  const normalizedLimit = Math.min(Math.max(Math.trunc(limit || DEFAULT_LIMIT), 1), MAX_LIMIT);
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const skills = listProjectSkills(root);
  if (terms.length === 0) return skills.slice(0, normalizedLimit);
  return skills
    .filter((skill) => {
      const haystack = `${skill.name}\n${skill.description}\n${skill.path}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, normalizedLimit);
}

export function loadProjectSkill(root: string, nameOrPath: string): LoadedSkill {
  const projectRoot = resolve(root);
  const skills = listProjectSkills(projectRoot);
  const wanted = nameOrPath.toLowerCase();
  const match = skills.find((skill) => skill.name.toLowerCase() === wanted || skill.path.toLowerCase() === wanted || skill.path.toLowerCase().endsWith(`/${wanted}/${SKILL_FILE.toLowerCase()}`));
  if (!match) throw new Error(`Skill not found: ${nameOrPath}`);
  const skillPath = resolve(projectRoot, match.path);
  if (!isInside(projectRoot, skillPath) || basename(skillPath) !== SKILL_FILE) throw new Error(`Refusing to load unsafe skill path: ${nameOrPath}`);
  return { ...match, content: readFileSync(skillPath, "utf8") };
}
