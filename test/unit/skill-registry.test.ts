import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findProjectSkills, loadProjectSkill } from "../../src/mcp/skill-registry";

describe("skill registry MCP adapter helpers", () => {
  it("finds and loads project-local SKILL.md files without executing target code", () => {
    const root = mkdtempSync(join(tmpdir(), "skill-registry-"));
    const skill = join(root, "skills", "headroom-token-minimizer");
    mkdirSync(skill, { recursive: true });
    writeFileSync(
      join(skill, "SKILL.md"),
      "---\nname: headroom-token-minimizer\ndescription: Minimize context tokens while preserving audit evidence.\ndisable-model-invocation: false\n---\n# Headroom Token Minimizer\n",
      "utf8",
    );

    expect(findProjectSkills(root, "headroom")).toEqual([
      {
        name: "headroom-token-minimizer",
        description: "Minimize context tokens while preserving audit evidence.",
        path: "skills/headroom-token-minimizer/SKILL.md",
      },
    ]);

    const loaded = loadProjectSkill(root, "headroom-token-minimizer");
    expect(loaded.content).toContain("# Headroom Token Minimizer");
  });
});
