import { allowRetry, classifyTerminal, freezePlan, verifyEnvelope, type OrchestratorInput } from "../src/orchestration/engine";
import {
  normalizeIntent,
  validateContextInfluence,
  validateEnvironmentParity,
  validateIntentMonotonicity,
  type CompiledCapability,
  type EvidenceReceipt,
  type GoalContract,
  type IntentContract,
} from "../src/domain/orchestration-contracts";

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
      scope: ["repository"],
      requiredContext: ["canon"],
      evidenceGate: ["unit test"],
      mutationPolicy: "QUARANTINE_ONLY",
      dependencies: [],
      acceptance: ["unit test passes"],
      authorityGate: "PREAUTHORIZED",
      riskAuthorityBoundary: "pre-authorized quarantine mutation",
    },
    {
      id: "B",
      objective: "verify",
      intent: ["VERIFY"],
      executionPolicy: "bounded",
      scope: ["repository"],
      requiredContext: ["canon"],
      evidenceGate: ["runtime test"],
      mutationPolicy: "READ_ONLY",
      dependencies: ["A"],
      acceptance: ["runtime test passes"],
      authorityGate: "READ_ONLY",
      riskAuthorityBoundary: "read-only verification",
    },
  ],
  requiredEvidence: ["provenance"],
  acceptanceTests: ["unit", "runtime"],
  availableTools: ["GitHub"],
  retryBudget: 2,
  provenance: ["governing command"],
};

const passReceipt = (requirementId: string, sourceKind: EvidenceReceipt["sourceKind"] = "CI"): EvidenceReceipt => ({
  requirementId,
  sourceKind,
  sourceLocator: `evidence://${requirementId}`,
  provenance: "test fixture",
  status: "PASS",
  observedAt: "2026-09-04T00:00:00Z",
});

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

  test("dependency cycles fail closed", () => {
    const bad = {
      ...input,
      nodes: [
        { ...input.nodes[0]!, dependencies: ["B"] },
        { ...input.nodes[1]!, dependencies: ["A"] },
      ],
    };
    expect(() => freezePlan(bad)).toThrow(/Dependency cycle detected/);
  });

  test("unknown runtime intent classes cannot inject task kinds", () => {
    const bad = { ...input, nodes: [{ ...input.nodes[0]!, intent: ["ARBITRARY_EXECUTION" as never] }] };
    expect(() => freezePlan(bad)).toThrow(/Unknown intent class/);
  });

  test("goal scope cannot silently expand", () => {
    const bad = { ...input, nodes: [{ ...input.nodes[0]!, scope: ["repository", "production-account"] }] };
    expect(() => freezePlan(bad)).toThrow(/expands scope/);
  });

  test("unknown required context fails closed", () => {
    const bad = { ...input, nodes: [{ ...input.nodes[0]!, requiredContext: ["missing-context"] }] };
    expect(() => freezePlan(bad)).toThrow(/Unknown required context/);
  });

  test("decision-critical conflicted context cannot enter a frozen plan", () => {
    const bad = {
      ...input,
      context: {
        ...input.context,
        primitives: input.context.primitives.map((primitive) => ({ ...primitive, evidenceStatus: "CONFLICTED" as const })),
      },
    };
    expect(() => freezePlan(bad)).toThrow(/Decision-critical context is not KNOWN/);
  });

  test("consequential user and security authority forks are not silently templated", () => {
    const userGate = { ...input, nodes: [{ ...input.nodes[0]!, authorityGate: "USER_DECISION_REQUIRED" as const }] };
    const securityGate = { ...input, nodes: [{ ...input.nodes[0]!, authorityGate: "EXTERNAL_APPROVAL_REQUIRED" as const, riskAuthorityBoundary: "security approval" }] };
    expect(() => freezePlan(userGate)).toThrow(/explicit authority boundary/);
    expect(() => freezePlan(securityGate)).toThrow(/explicit authority boundary/);
  });

  test("retries require changed intervention and are bounded", () => {
    const one = allowRetry([], 2, { failureFingerprint: "same", changedVariable: "patch-a" });
    expect(one.attempt).toBe(1);
    expect(() => allowRetry([one], 2, { failureFingerprint: "same", changedVariable: "patch-a" })).toThrow(/Retry loop detected/);
    const two = allowRetry([one], 2, { failureFingerprint: "same", changedVariable: "patch-b" });
    expect(() => allowRetry([one, two], 2, { failureFingerprint: "new", changedVariable: "patch-c" })).toThrow(/budget exhausted/);
    expect(() => allowRetry([], 2, { failureFingerprint: "", changedVariable: "patch" })).toThrow(/fingerprint/);
  });

  test("terminal VERIFIED requires auditable passing evidence rather than a boolean", () => {
    expect(classifyTerminal({ requiredEvidence: ["unit", "runtime"], evidence: [passReceipt("unit"), passReceipt("runtime", "RUNTIME")] }).state).toBe("VERIFIED");
    expect(classifyTerminal({ requiredEvidence: ["unit", "runtime"], evidence: [passReceipt("unit")] })).toEqual(expect.objectContaining({ state: "FAILED", reason: expect.stringMatching(/Missing passing/) }));
    expect(classifyTerminal({ requiredEvidence: [], evidence: [] }).state).toBe("FAILED");
  });

  test("terminal classifier separates blocker decision and failure", () => {
    expect(classifyTerminal({ requiredEvidence: ["x"], evidence: [], externalDependencyUnavailable: "critic unavailable" }).state).toBe("EXTERNALLY_BLOCKED");
    expect(classifyTerminal({ requiredEvidence: ["x"], evidence: [], userDecision: "publish?" }).state).toBe("USER_DECISION_REQUIRED");
    expect(classifyTerminal({ requiredEvidence: ["x"], evidence: [], unrepairedFailure: "test failed" }).state).toBe("FAILED");
  });

  test("independent review cannot be self-certified by ordinary CI evidence", () => {
    const requiredEvidence = ["unit"];
    expect(classifyTerminal({ requiredEvidence, evidence: [passReceipt("unit")], independentReviewRequired: true }).state).toBe("FAILED");
    expect(classifyTerminal({ requiredEvidence, evidence: [passReceipt("unit"), passReceipt("independent", "INDEPENDENT_REVIEW")], independentReviewRequired: true }).state).toBe("VERIFIED");
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

  test("environment adapter parity drift is explicit", () => {
    const capability: CompiledCapability = {
      id: "cap",
      version: "1",
      lifecycle: "PROVISIONAL",
      contractHash: "a",
      influenceHash: "b",
      compilerVersion: "1",
      taxonomyVersion: "1",
      sourceComponents: ["source"],
      executionGraph: ["A"],
      invariants: ["same behavior"],
      allowedBranches: ["main"],
      forbiddenActions: [],
      inputSchemaId: "in",
      outputSchemaId: "out",
      evaluation: { version: "1", acceptanceTests: ["parity"], adversarialTests: [], independentReviewRequired: false },
      environmentAdapters: ["local", "remote"],
    };
    expect(validateEnvironmentParity(capability, ["local"])).toEqual(["Declared environment adapter not observed: remote"]);
    expect(validateEnvironmentParity(capability, ["local", "remote"])).toEqual([]);
  });
});
