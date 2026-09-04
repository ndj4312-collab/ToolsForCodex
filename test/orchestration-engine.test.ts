import { allowRetry, classifyTerminal, freezePlan, verifyEnvelope, type OrchestratorInput } from "../src/orchestration/engine";
import { normalizeIntent, validateContextInfluence, validateIntentMonotonicity, type GoalContract, type IntentContract } from "../src/domain/orchestration-contracts";

const goal: GoalContract = {
  version: "1",
  obligation: "Finish evidence-backed work without weakening the goal",
  requiredOutcomes: ["tested result"],
  prohibitedReinterpretations: ["ideation counts as completion"],
  scope: ["repository"],
  userChangeAuthorityRequired: true,
};

const intent: IntentContract = {
  version: "1",
  classes: ["EXECUTE", "VERIFY"],
  obligations: ["tested result"],
  prohibitedWeakenings: ["skip tests"],
  allowedSpecializations: ["add security tests"],
  completionSemantics: ["acceptance evidence exists"],
};

const input: OrchestratorInput = {
  version: "1.0",
  goal,
  intent,
  context: {
    version: "1",
    invariants: ["canonical source wins"],
    constraints: [],
    requiredEvidence: ["runtime test"],
    prohibitedMethods: [],
    preferredMethods: ["deterministic"],
    environment: ["CI"],
    toolCapabilities: ["GitHub"],
    primitives: [{
      id: "canon",
      value: "AGENTS.md",
      provenance: "repo",
      authority: "policy",
      freshness: "current main",
      evidenceStatus: "KNOWN",
      priority: "P0",
      expectedInfluence: ["CONSTRAIN"],
    }],
  },
  nodes: [
    {
      id: "A",
      objective: "implement",
      intent: ["EXECUTE"],
      executionPolicy: "bounded",
      requiredContext: ["canon"],
      evidenceGate: ["unit test"],
      mutationPolicy: "QUARANTINE_ONLY",
      dependencies: [],
      acceptance: ["unit test passes"],
      riskAuthorityBoundary: "pre-authorized quarantine mutation",
    },
    {
      id: "B",
      objective: "verify",
      intent: ["VERIFY"],
      executionPolicy: "bounded",
      requiredContext: ["canon"],
      evidenceGate: ["runtime test"],
      mutationPolicy: "READ_ONLY",
      dependencies: ["A"],
      acceptance: ["runtime test passes"],
      riskAuthorityBoundary: "read-only verification",
    },
  ],
  requiredEvidence: ["provenance"],
  acceptanceTests: ["unit", "runtime"],
  availableTools: ["GitHub"],
  retryBudget: 2,
  provenance: ["governing command"],
};

describe("deterministic completion orchestrator", () => {
  test("equivalent frozen input is deterministic", () => {
    expect(freezePlan(input)).toEqual(freezePlan(input));
  });

  test("dependency graph is explicit and ordered", () => {
    const plan = freezePlan(input);
    expect(plan.microtasks.map((task) => task.id)).toEqual(["A:IMPLEMENT_PATCH", "B:TEST"]);
    expect(plan.dependencyGraph["B:TEST"]).toEqual(["A:IMPLEMENT_PATCH"]);
  });

  test("hidden or unresolved dependencies fail closed", () => {
    const bad = { ...input, nodes: [{ ...input.nodes[0]!, dependencies: ["missing"] }] };
    expect(() => freezePlan(bad)).toThrow(/Unknown dependency/);
  });

  test("consequential authority forks are not silently templated", () => {
    const bad = { ...input, nodes: [{ ...input.nodes[0]!, riskAuthorityBoundary: "user preference required" }] };
    expect(() => freezePlan(bad)).toThrow(/explicit authority boundary/);
  });

  test("retries require changed intervention and are bounded", () => {
    const one = allowRetry([], 2, { failureFingerprint: "same", changedVariable: "patch-a" });
    expect(one.attempt).toBe(1);
    expect(() => allowRetry([one], 2, { failureFingerprint: "same", changedVariable: "patch-a" })).toThrow(/Retry loop detected/);
    const two = allowRetry([one], 2, { failureFingerprint: "same", changedVariable: "patch-b" });
    expect(() => allowRetry([one, two], 2, { failureFingerprint: "new", changedVariable: "patch-c" })).toThrow(/budget exhausted/);
  });

  test("terminal classifier separates verified/blocker/decision/failure", () => {
    expect(classifyTerminal({ acceptancePassed: true }).state).toBe("VERIFIED");
    expect(classifyTerminal({ acceptancePassed: false, externalDependencyUnavailable: "independent critic unavailable" }).state).toBe("EXTERNALLY_BLOCKED");
    expect(classifyTerminal({ acceptancePassed: false, userDecision: "publish?" }).state).toBe("USER_DECISION_REQUIRED");
    expect(classifyTerminal({ acceptancePassed: false, unrepairedFailure: "test failed" }).state).toBe("FAILED");
  });

  test("freeze requires explicit recompile after envelope drift", () => {
    const plan = freezePlan(input);
    expect(() => verifyEnvelope(plan, "0".repeat(64))).toThrow(/recompile required/);
    expect(() => verifyEnvelope(plan, plan.envelopeHash)).not.toThrow();
  });
});

describe("representation/compiler invariants", () => {
  test("intent normalization is deterministic across ordering", () => {
    const a = normalizeIntent({ ...intent, obligations: ["b", "a", "a"], classes: ["VERIFY", "EXECUTE"] });
    const b = normalizeIntent({ ...intent, obligations: ["a", "b"], classes: ["EXECUTE", "VERIFY"] });
    expect(a).toEqual(b);
  });

  test("intent weakening fails", () => {
    const downstream = { ...intent, obligations: [] };
    expect(validateIntentMonotonicity(goal, intent, downstream)).toEqual(expect.arrayContaining([expect.stringMatching(/weakened|Goal outcome/)]));
  });

  test("mechanically inert P0/P1 context fails", () => {
    expect(validateContextInfluence(input.context, [])).toEqual(["Decision-critical context is mechanically inert: canon"]);
    expect(validateContextInfluence(input.context, [{ contextId: "canon", effect: "CONSTRAIN", target: "mutation", reason: "policy" }])).toEqual([]);
  });
});
