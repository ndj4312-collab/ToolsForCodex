import { join } from "node:path";
import { validateSkillIr, type SkillIr } from "../../src/domain/skill-ir";
import { readSkillMetadata, validateSkillMetadata } from "../../src/validation/skill-metadata";

const root = join(__dirname, "../..");

function metadataFor(relativeSkill: string) {
  return readSkillMetadata(join(root, relativeSkill, "SKILL.md"), join(root, relativeSkill, "agents", "openai.yaml"));
}

describe("skill invocation policy", () => {
  it("keeps human controllers unreachable by implicit invocation", () => {
    for (const skill of ["skills/production-orchestrator", "skills/engineering/standardize-skills-to-matt-pocock"]) {
      const metadata = metadataFor(skill);
      expect(metadata.userInvoked).toBe(true);
      expect(metadata.allowImplicitInvocation).toBe(false);
      expect(validateSkillMetadata(metadata)).toEqual([]);
    }
  });

  it("keeps the reusable validator model-invoked with trigger wording", () => {
    const metadata = metadataFor("skills/engineering/matt-skill-contract-audit");
    expect(metadata.userInvoked).toBe(false);
    expect(metadata.allowImplicitInvocation).toBe(true);
    expect(validateSkillMetadata(metadata)).toEqual([]);
  });

  it("rejects executable instructions and sibling skill dependencies in the IR", () => {
    const skill: SkillIr = {
      name: "matt-skill-contract-audit",
      invocationMode: "model",
      lifecycleBucket: "engineering",
      portableInstructions: "Audit metadata and report evidence.",
      declaredInputs: ["skill source"],
      declaredOutputs: ["findings"],
      dependencies: [],
      ownedReferenceFiles: ["references/rubric.md"],
      runtimeCapabilityRequirements: ["file-read"],
      sourceHash: "a".repeat(64),
      reviewState: "reviewed",
      distributionMode: "managed-claude-plugin"
    };
    expect(validateSkillIr(skill)).toEqual([]);
    expect(validateSkillIr({ ...skill, portableInstructions: "```sh\nrm -rf x\n```" })).not.toEqual([]);
    expect(validateSkillIr({ ...skill, ownedReferenceFiles: ["../other-skill/ref.md"] })).not.toEqual([]);
  });
});
