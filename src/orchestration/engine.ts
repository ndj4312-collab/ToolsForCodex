import {
  authorityGates,
  canonicalHash,
  intentClasses,
  validateCriticalContextReadiness,
  validateIntentMonotonicity,
  type ContextContract,
  type EvidenceReceipt,
  type GoalContract,
  type IntentContract,
  type PlanNode,
} from "../domain/orchestration-contracts";

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
  readonly authorityGate: PlanNode["authorityGate"];
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

function assertAcyclic(nodes: readonly PlanNode[]): void {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (id: string, path: readonly string[]): void => {
    if (visiting.has(id)) throw new Error(`Dependency cycle detected: ${[...path, id].join(" -> ")}`);
    if (visited.has(id)) return;
    visiting.add(id);
    const node = byId.get(id)!;
    for (const dep of node.dependencies) visit(dep, [...path, id]);
    visiting.delete(id);
    visited.add(id);
  };

  for (const node of nodes) visit(node.id, []);
}

function assertInput(input: OrchestratorInput): void {
  const nodes = input.nodes;
  const ids = new Set(nodes.map((node) => node.id));
  if (ids.size !== nodes.length) throw new Error("Duplicate PlanNode id");
  if (input.retryBudget < 0 || !Number.isInteger(input.retryBudget)) throw new Error("Retry budget must be a non-negative integer");

  const validIntent = new Set<string>(intentClasses);
  const validAuthorityGate = new Set<string>(authorityGates);
  const goalScope = new Set(input.goal.scope);
  const contextIds = new Set(input.context.primitives.map((primitive) => primitive.id));

  const intentErrors = validateIntentMonotonicity(input.goal, input.intent, input.intent);
  if (intentErrors.length > 0) throw new Error(intentErrors.join("; "));

  const contextErrors = validateCriticalContextReadiness(input.context);
  if (contextErrors.length > 0) throw new Error(contextErrors.join("; "));

  for (const intentClass of input.intent.classes as readonly string[]) {
    if (!validIntent.has(intentClass)) throw new Error(`Unknown intent class in IntentContract: ${intentClass}`);
  }

  for (const node of nodes) {
    if (!node.id.trim() || !node.objective.trim() || node.acceptance.length === 0 || node.intent.length === 0 || node.scope.length === 0) {
      throw new Error(`PlanNode ${node.id || "<missing>"} is not template-eligible`);
    }
    for (const intentClass of node.intent as readonly string[]) {
      if (!validIntent.has(intentClass)) throw new Error(`Unknown intent class ${intentClass} for ${node.id}`);
    }
    if (!validAuthorityGate.has(node.authorityGate)) throw new Error(`Unknown authority gate ${String(node.authorityGate)} for ${node.id}`);
    if (node.authorityGate === "USER_DECISION_REQUIRED" || node.authorityGate === "EXTERNAL_APPROVAL_REQUIRED") {
      throw new Error(`PlanNode ${node.id} requires an explicit authority boundary before deterministic execution`);
    }
    for (const item of node.scope) if (!goalScope.has(item)) throw new Error(`PlanNode ${node.id} expands scope outside GoalContract: ${item}`);
    for (const contextId of node.requiredContext) if (!contextIds.has(contextId)) throw new Error(`Unknown required context ${contextId} for ${node.id}`);
    for (const dep of node.dependencies) {
      if (!ids.has(dep)) throw new Error(`Unknown dependency ${dep} for ${node.id}`);
      if (dep === node.id) throw new Error(`PlanNode ${node.id} cannot depend on itself`);
    }
  }

  assertAcyclic(nodes);
}

export function freezePlan(input: OrchestratorInput): OrchestratorPlan {
  assertInput(input);
  const microtasks = [...input.nodes]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((node): MicroTask => ({
      id: `${node.id}:${classifyNode(node)}`,
      nodeId: node.id,
      kind: classifyNode(node),
      dependencies: [...node.dependencies].sort().map((dep) => `${dep}:${classifyNode(input.nodes.find((candidate) => candidate.id === dep)!)}`),
      evidenceRequired: [...new Set([...node.evidenceGate, ...input.requiredEvidence])].sort(),
      mutationPolicy: node.mutationPolicy,
      authorityGate: node.authorityGate,
      stopBoundary: node.riskAuthorityBoundary,
    }));
  const dependencyGraph = Object.fromEntries(microtasks.map((task) => [task.id, task.dependencies]));
  const envelopeHash = canonicalHash({ goal: input.goal, intent: input.intent, context: input.context, microtasks, acceptanceTests: input.acceptanceTests, provenance: input.provenance });
  return { version: "1.0", envelopeHash, microtasks, dependencyGraph, state: "FROZEN" };
}

export function classifyTerminal(input: {
  requiredEvidence: readonly string[];
  evidence: readonly EvidenceReceipt[];
  independentReviewRequired?: boolean;
  externalDependencyUnavailable?: string;
  userDecision?: string;
  unrepairedFailure?: string;
}): { state: TerminalState; reason: string } {
  if (input.externalDependencyUnavailable) return { state: "EXTERNALLY_BLOCKED", reason: input.externalDependencyUnavailable };
  if (input.userDecision) return { state: "USER_DECISION_REQUIRED", reason: input.userDecision };
  if (input.unrepairedFailure) return { state: "FAILED", reason: input.unrepairedFailure };
  if (input.requiredEvidence.length === 0) return { state: "FAILED", reason: "No acceptance evidence requirements were declared" };

  const receiptsByRequirement = new Map<string, EvidenceReceipt[]>();
  for (const receipt of input.evidence) {
    if (!receipt.requirementId.trim() || !receipt.sourceLocator.trim() || !receipt.provenance.trim() || !receipt.observedAt.trim()) {
      return { state: "FAILED", reason: "Evidence receipt is missing auditable provenance or locator metadata" };
    }
    const receipts = receiptsByRequirement.get(receipt.requirementId) ?? [];
    receipts.push(receipt);
    receiptsByRequirement.set(receipt.requirementId, receipts);
  }

  for (const requirement of input.requiredEvidence) {
    const receipts = receiptsByRequirement.get(requirement) ?? [];
    if (receipts.some((receipt) => receipt.status === "FAIL")) return { state: "FAILED", reason: `Acceptance evidence failed: ${requirement}` };
    if (!receipts.some((receipt) => receipt.status === "PASS")) return { state: "FAILED", reason: `Missing passing acceptance evidence: ${requirement}` };
  }

  if (input.independentReviewRequired) {
    const independent = input.evidence.some((receipt) => receipt.sourceKind === "INDEPENDENT_REVIEW" && receipt.status === "PASS");
    if (!independent) return { state: "FAILED", reason: "Independent review evidence is required but absent" };
  }

  return { state: "VERIFIED", reason: "All declared acceptance evidence has passing auditable receipts" };
}

export function allowRetry(history: readonly RetryRecord[], retryBudget: number, next: Omit<RetryRecord, "attempt">): RetryRecord {
  if (history.length >= retryBudget) throw new Error("Retry budget exhausted");
  if (!next.changedVariable.trim()) throw new Error("Retry requires a changed variable/hypothesis/patch");
  if (!next.failureFingerprint.trim()) throw new Error("Retry requires a failure fingerprint");
  const repeated = history.filter((item) => item.failureFingerprint === next.failureFingerprint);
  if (repeated.some((item) => item.changedVariable === next.changedVariable)) {
    throw new Error("Retry loop detected: repeated failure fingerprint with unchanged intervention");
  }
  return { attempt: history.length + 1, ...next };
}

export function verifyEnvelope(plan: OrchestratorPlan, expectedHash: string): void {
  if (plan.envelopeHash !== expectedHash) throw new Error("Frozen execution envelope changed; explicit recompile required");
}
