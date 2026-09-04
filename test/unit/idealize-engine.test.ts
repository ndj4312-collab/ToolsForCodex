import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eligibleTasks, type IdealProjectPlan, validateIdealProjectPlan } from "../../src/idealize/engine";

const fixture = (): IdealProjectPlan => JSON.parse(readFileSync(join(__dirname, "../fixtures/idealize/reference-plan.json"), "utf8")) as IdealProjectPlan;

describe("idealize executable plan control plane", () => {
  it("accepts the reference stress plan and exposes only dependency-safe work", () => {
    const plan = fixture();
    expect(validateIdealProjectPlan(plan)).toEqual({ status: "VERIFIED", findings: [] });
    expect(eligibleTasks(plan, new Set()).map((task) => task.id)).toEqual(["IDEAL-001"]);
    expect(eligibleTasks(plan, new Set(["IDEAL-001"])).map((task) => task.id)).toEqual(["IDEAL-002", "IDEAL-003"]);
  });

  it("fails closed on orphan requirements, dangling edges, and cycles", () => {
    const plan = fixture();
    plan.requirements.push({ id: "R-ORPHAN", statement: "Must not disappear", evidence: ["fixture"] });
    plan.edges.push({ from: "IDEAL-001", to: "IDEAL-004", relation: "REQUIRES" });
    const result = validateIdealProjectPlan(plan);
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map((finding) => finding.code)).toEqual(expect.arrayContaining(["ORPHAN_REQUIREMENT", "DEPENDENCY_CYCLE"]));
  });

  it("rejects claimed atomic tasks without evidence or executable branching", () => {
    const plan = fixture();
    plan.tasks[0]!.evidence = [];
    plan.tasks[0]!.branch = "continue if possible";
    const codes = validateIdealProjectPlan(plan).findings.map((finding) => finding.code);
    expect(codes).toEqual(expect.arrayContaining(["MISSING_EVIDENCE", "INVALID_BRANCH"]));
  });

  it("rejects false parallelism when same-wave tasks share a write target", () => {
    const plan = fixture();
    plan.tasks[2]!.writeSet = ["candidate inheritance manifest"];
    expect(validateIdealProjectPlan(plan).findings.map((finding) => finding.code)).toContain("PARALLEL_WRITE_COLLISION");
  });

  it("fails closed when a declared prerequisite has no matching dependency edge and still blocks execution", () => {
    const plan = fixture();
    const task = plan.tasks.find((candidate) => candidate.id === "IDEAL-002")!;
    plan.edges = plan.edges.filter((edge) => !(edge.relation === "REQUIRES" && edge.from === "IDEAL-002" && edge.to === "IDEAL-001"));
    const result = validateIdealProjectPlan(plan);
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map((finding) => finding.code)).toContain("PREREQUISITE_EDGE_DRIFT");
    expect(task.prerequisites).toContain("IDEAL-001");
    expect(eligibleTasks(plan, new Set()).map((candidate) => candidate.id)).not.toContain("IDEAL-002");
  });

  it("fails closed when a prerequisite names a task that does not exist", () => {
    const plan = fixture();
    plan.tasks[1]!.prerequisites.push("IDEAL-MISSING");
    const result = validateIdealProjectPlan(plan);
    expect(result.status).toBe("BLOCKED");
    expect(result.findings.map((finding) => finding.code)).toContain("UNKNOWN_PREREQUISITE");
    expect(eligibleTasks(plan, new Set(["IDEAL-001"])).map((candidate) => candidate.id)).not.toContain(plan.tasks[1]!.id);
  });
});
