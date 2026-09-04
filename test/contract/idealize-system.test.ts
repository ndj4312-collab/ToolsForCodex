import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import { findProjectSkills, loadProjectSkill } from "../../src/mcp/skill-registry";

const root = join(__dirname, "../..");

describe("idealize capability ecosystem", () => {
  it("discovers and loads all four stage skills through the production registry", () => {
    for (const name of ["about", "investigate", "monolithize", "idealize"]) {
      expect(findProjectSkills(root, name).some((skill) => skill.name === name)).toBe(true);
      const loaded = loadProjectSkill(root, name);
      expect(loaded.path).toBe(`skills/idealize-system/${name}/SKILL.md`);
      expect(loaded.content).toContain(`name: ${name}`);
    }
  });

  it("keeps canonical source precedence and fail-closed rules machine-readable", () => {
    const registry = JSON.parse(readFileSync(join(root, "skills/idealize-system/capability-registry.json"), "utf8"));
    expect(registry.precedence.slice(0, 3)).toEqual(["verified-runtime", "canonical-repository", "canonical-notion-ledger"]);
    const route = JSON.parse(readFileSync(join(root, "skills/idealize-system/route.json"), "utf8"));
    expect(route.fail_closed).toEqual(expect.arrayContaining(["canonical-source-conflict", "stale-evidence", "missing-provenance", "unverified-completion-claim"]));
  });

  it("encodes the mandated adaptation and workaround ladders in order", () => {
    const route = JSON.parse(readFileSync(join(root, "skills/idealize-system/route.json"), "utf8"));
    expect(route.adaptation_order).toEqual(["USE", "WRAP", "SPECIALIZE", "COMPOSE", "MODIFY", "EXTRACT_PATTERN", "BUILD"]);
    expect(route.workaround_order[0]).toBe("correct-invocation");
    expect(route.workaround_order.at(-1)).toBe("privileged-user-escalation");
  });

  it("registers complete capability ownership and an executable control plane", () => {
    const registry = JSON.parse(readFileSync(join(root, "skills/idealize-system/capability-registry.json"), "utf8"));
    expect(registry.capabilities).toHaveLength(8);
    for (const capability of registry.capabilities) {
      expect(capability).toEqual(expect.objectContaining({ source: expect.any(String), license: expect.any(String), harness: expect.any(String), routing: expect.any(String), owner: "idealize-system" }));
    }
    const control = JSON.parse(readFileSync(join(root, "skills/idealize-system/control-plane.json"), "utf8"));
    expect(control.pipeline).toEqual(["normalize","inject-canonical-context","route-capability","execute","persist-evidence","validate","route-next","adversarial-evaluate","repair-or-workaround","final-validate","canonicalize"]);
    expect(control["plan-compile"].validator).toBe("src/idealize/engine.ts");
    const byId = new Map<string, { dependencies: string[] }>(registry.capabilities.map((capability: { id: string; dependencies: string[] }) => [capability.id, capability]));
    const visit = (id: string, path: string[]): void => {
      expect(path).not.toContain(id);
      for (const dependency of byId.get(id)?.dependencies ?? []) {
        expect(byId.has(dependency)).toBe(true);
        visit(dependency, [...path, id]);
      }
    };
    for (const id of byId.keys()) visit(id, []);
  });

  it("traces every TOTAL command section to a durable mechanism and verification", () => {
    const map = JSON.parse(readFileSync(join(root, "skills/idealize-system/requirements-map.json"), "utf8"));
    expect(map.requirements.map((item: { id: string }) => item.id)).toEqual(["IDEAL-MISSION", ...Array.from({ length: 24 }, (_, index) => `IDEAL-${String(index).padStart(2, "0")}`)]);
    for (const item of map.requirements) expect(item).toEqual(expect.objectContaining({ mechanism: expect.any(String), verification: expect.any(String) }));
  });

  it("validates the capability registry and route schemas", () => {
    const ajv = new Ajv2020({ strict: false });
    const pairs: Array<[string, string]> = [["skills/idealize-system/capability-registry.json", "contracts/idealize-capability-registry.schema.json"],["skills/idealize-system/route.json", "contracts/idealize-route.schema.json"]];
    for (const [dataPath, schemaPath] of pairs) {
      const data = JSON.parse(readFileSync(join(root, dataPath), "utf8"));
      const schema = JSON.parse(readFileSync(join(root, schemaPath), "utf8"));
      expect(ajv.validate(schema, data)).toBe(true);
    }
  });

  it("fails closed for unknown skill IDs rather than path guessing", () => {
    expect(() => loadProjectSkill(root, "idealize-does-not-exist")).toThrow("Skill not found");
    expect(() => loadProjectSkill(root, "../../etc/passwd")).toThrow("Skill not found");
  });

  it("makes the primary plan contract and material-failure regression rule explicit", () => {
    const idealize = loadProjectSkill(root, "idealize").content;
    expect(idealize).toContain("the-ideal-project-plan.md");
    expect(idealize).toContain("Every material discovered implementation failure becomes a regression fixture before repair");
    for (const relation of ["REQUIRES", "BLOCKS", "PARALLEL_WITH", "CONFLICTS_WITH", "PRODUCES", "CONSUMES", "VERIFIES", "FALLBACK_FOR"]) expect(idealize).toContain(relation);
  });
});
