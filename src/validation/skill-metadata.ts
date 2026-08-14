import { readFileSync } from "node:fs";

export interface SkillMetadata {
  readonly name: string;
  readonly description: string;
  readonly userInvoked: boolean;
  readonly allowImplicitInvocation: boolean;
}

function frontmatterValue(markdown: string, key: string): string | undefined {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim();
}

function yamlValue(yaml: string, key: string): string | undefined {
  const match = yaml.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim();
}

export function readSkillMetadata(skillMarkdownPath: string, openAiYamlPath: string): SkillMetadata {
  const markdown = readFileSync(skillMarkdownPath, "utf8");
  const yaml = readFileSync(openAiYamlPath, "utf8");
  const name = frontmatterValue(markdown, "name");
  const description = frontmatterValue(markdown, "description");
  const disabled = frontmatterValue(markdown, "disable-model-invocation");
  const implicit = yamlValue(yaml, "allow_implicit_invocation");
  if (!name || !description || (disabled !== "true" && disabled !== "false") || (implicit !== "true" && implicit !== "false")) throw new Error("Skill metadata is malformed");
  return { name, description, userInvoked: disabled === "true", allowImplicitInvocation: implicit === "true" };
}

export function validateSkillMetadata(metadata: SkillMetadata): readonly string[] {
  const errors: string[] = [];
  if (metadata.userInvoked === metadata.allowImplicitInvocation) errors.push("frontmatter and OpenAI invocation policies disagree");
  if (metadata.userInvoked && /\b(when|if|use for|trigger)\b/i.test(metadata.description)) errors.push("human-invoked description cannot contain trigger wording");
  if (!metadata.userInvoked && !/\b(when|validating|audit)\b/i.test(metadata.description)) errors.push("model-invoked description lacks model-facing trigger wording");
  return errors;
}
