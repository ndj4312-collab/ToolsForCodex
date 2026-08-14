export const invocationModes = ["user", "model"] as const;
export const lifecycleBuckets = ["engineering", "productivity", "misc", "in-progress", "deprecated"] as const;
export const reviewStates = ["unreviewed", "reviewed", "approved", "blocked"] as const;
export const distributionModes = ["claude-plugin", "skills-sh-editable", "skillshare-approved-sync"] as const;

export type InvocationMode = (typeof invocationModes)[number];
export type LifecycleBucket = (typeof lifecycleBuckets)[number];
export type ReviewState = (typeof reviewStates)[number];
export type DistributionMode = (typeof distributionModes)[number];

export interface SkillIr {
  readonly name: string;
  readonly invocationMode: InvocationMode;
  readonly lifecycleBucket: LifecycleBucket;
  readonly portableInstructions: string;
  readonly declaredInputs: readonly string[];
  readonly declaredOutputs: readonly string[];
  readonly dependencies: readonly `/${string}`[];
  readonly ownedReferenceFiles: readonly string[];
  readonly runtimeCapabilityRequirements: readonly string[];
  readonly sourceHash: string;
  readonly reviewState: ReviewState;
  readonly distributionMode: DistributionMode;
}

/**
 * IR invariants: instructions are portable prose; dependencies use `/skill-name`;
 * owned references are within the skill; executable snippets and sibling paths are absent.
 */
export function validateSkillIr(skill: SkillIr): readonly string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name)) errors.push("name must be kebab-case");
  if (!/^[a-f0-9]{64}$/.test(skill.sourceHash)) errors.push("sourceHash must be SHA-256 hex");
  if (/(```(?:sh|bash|powershell|cmd)|\$\(|;\s*(?:rm|del|curl|wget)\b)/i.test(skill.portableInstructions)) errors.push("portableInstructions contains executable shell content");
  if (skill.dependencies.some((dependency) => !/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dependency))) errors.push("dependencies must use /skill-name invocation");
  if (skill.ownedReferenceFiles.some((file) => /(^|[\\/])\.\.([\\/]|$)|(^|[\\/])skills[\\/]/i.test(file))) errors.push("ownedReferenceFiles cannot contain sibling-relative paths");
  return errors;
}
