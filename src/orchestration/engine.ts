import { canonicalHash, type ContextContract, type GoalContract, type IntentContract, type PlanNode } from "../domain/orchestration-contracts";

export const microTaskKinds = [
  "DISCOVER", "EXTRACT", "NORMALIZE", "COMPARE", "RESEARCH_CLAIM", "VERIFY_CLAIM", "GENERATE_FIXTURE", "GENERATE_PROTOTYPE", "IMPLEMENT_PATCH", "TEST", "STATIC_CHECK", "SECURITY_TEST", "REDTEAM", "REPAIR", "RETEST", "DOCUMENT_EVIDENCE", "CLASSIFY_BLOCKER", "COMPLETE",
] as const;
export type MicroTaskKind = (typeof microTaskKinds)[number];

export const progressStates = ["PENDING", "ELIGIBLE", "PLANNED", "FROZEN", "EXECUTING", "VERIFYING", "REPAIRING", "VERIFIED", "EXTERNALLY_BLOCKED", "USER_DECISION_REQUIRED", "FAILED"] as const;
export type ProgressState = (typeof progressStates)[number];
export type TerminalState = Extract<ProgressState, "VERIFIED" | "EXTERNALLY_BLOCKED" | "USER_DECISION_REQUIRED" | "FAILED">;

export interface OrchestratorInput {
  readonly version: "1.0";
  readonly goal: GoalContract;
  readonly intent: IntentContract;
  readonly context: ContextContract;
  readonly nodes: readonly PlanNode[];
  readonly requiredEvidence: readonly string[];
  readonly acceptanceTests: readonly string[];
  readonly availableTools: readonly string[];
  readonly retryBudget: number;
  readonly provenance: readonly string[];
}

export interface MicroTask {
  readonly id: string;
  readonly nodeId: string;
  readonly kind: MicroTaskKind;
  readonly dependencies: readonly string[];
  readonly evidenceRequired: readonly string[];
  readonly mutationPolicy: PlanNode["mutationPolicy"];
  readonly stopBoundary: string;
}

export interface RetryRecord {
  readonly attempt: number;
  readonly failureFingerprint: string;
  readonly changedVariable: string;
}

export interface OrchestratorPlan {
  readonly version: "1.0";
  readonly envelopeHash: string;
  readonly microtasks: readonly MicroTask[];
  readonly dependencyGraph: Readonly<Record<string, readonly string[]>>;
  readonly state: "FROZEN";
}

function classifyNode(node: PlanNode): MicroTaskKind {
  const intent = new Set(node.intent);
  if (intent.has("VERIFY")) return "TEST";
  if (intent.has("REDTEAM")) return "REDTEAM";
  if (intent.has("DISCOVER") || intent.has("ORIENT")) return "DISCOVER";
  if (intent.has("COMPARE") || intent.has("DISCRIMINATE")) return "COMPARE";
  if (intent.has("EXECUTE") || intent.has("ADAPT") || intent.has("PROMOTE")) return "IMPLEMENT_PATCH";
  if (intent.has("DOCUMENT")) return "DOCUMENT_EVIDENCE";
  return "NORMALIZE";
}

function assertNodeGraph(nodes: readonly PlanNode[]): void {
  const ids = new Set(nodes.map((node) => node.id));
  if (ids.size !== nodes.length) throw new Error("Duplicate PlanNode id");
  for (const node of nodes) {
    for (const dep of node.dependencies) if (!ids.has(dep)) throw new Error(`Unknown dependency ${dep} for ${node.id}`);
    if (!node.objective.trim() || node.acceptance.length === 0) throw new Error(`PlanNode ${node.id} is not template-eligible`);
    if (/user preference|irreversible|publication|cost approval/i.test(node.riskAuthorityBoundary)) {
      throw new Error(`PlanNode ${node.id} requires an explicit authority boundary before deterministic execution`);
    }
  }
}

export function freezePlan(input: OrchestratorInput): OrchestratorPlan {
  assertNodeGraph(input.nodes);
  const microtasks = [...input.nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((node): MicroTask => ({
      id: `${node.id}:${classifyNode(node)}`,
      nodeId: node.id,
      kind: classifyNode(node),
      dependencies: [...node.dependencies].sort().map((dep) => `${dep}:${classifyNode(input.nodes.find((node) => node.id === dep)! )}`),
      evidenceRequired: [...new Set([...node.evidenceGate, ...input.requiredEvidence])].sort(),
      mutationPolicy: node.mutationPolicy,
      stopBoundary: node.riskAuthorityBoundary,
    }));
  const dependencyGraph = Object.fromEntries(microtasks.map((task) => [task.id, task.dependencies]));
  const envelopeHash = canonicalHash({ goal: input.goal, intent: input.intent, context: input.context, microtasks, acceptanceTests: input.acceptanceTests, provenance: input.provenance });
  return { version: "1.0", envelopeHash, microtasks, dependencyGraph, state: "FROZEN" };
}

export function classifyTerminal(input: {
  acceptancePassed: boolean;
  externalDependencyUnavailable?: string;
  userDecision?: string;
  unrepairedFailure?: string;
}): { state: TerminalState; reason: string } {
  if (input.externalDependencyUnavailable) return { state: "EXTERNALLY_BLOCKED", reason: input.externalDependencyUnavailable };
  if (input.userDecision) return { state: "USER_DECISION_REQUIRED", reason: input.userDecision };
  if (input.acceptancePassed) return { state: "VERIFIED", reason: "All acceptance evidence passed" };
  return { state: "FAILED", reason: input.unrepairedFailure ?? "Acceptance evidence did not pass" };
}

export function allowRetry(history: readonly RetryRecord[], retryBudget: number, next: Omit<RetryRecord, "attempt">): RetryRecord {
  if (history.length >= retryBudget) throw new Error("Retry budget exhausted");
  if (!next.changedVariable.trim()) throw new Error("Retry requires a changed variable/hypothesis/patch");
  const repeated = history.filter((item) => item.failureFingerprint === next.failureFingerprint);
  if (repeated.length > 0 && repeated.some((item) => item.changedVariable === next.changedVariable)) {
    throw new Error("Retry loop detected: repeated failure fingerprint with unchanged intervention");
  }
  return { attempt: history.length + 1, ...next };
}

export function verifyEnvelope(plan: OrchestratorPlan, expectedHash: string): void {
  if (plan.envelopeHash !== expectedHash) throw new Error("Frozen execution envelope changed; explicit recompile required");
}
