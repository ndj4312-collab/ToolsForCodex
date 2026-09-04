import { createHash } from "node:crypto";

export const intentClasses = [
  "ORIENT", "DISCOVER", "COMPARE", "DISCRIMINATE", "DESIGN", "PLAN", "ADAPT", "EXECUTE", "VERIFY", "REDTEAM", "DECIDE", "PROMOTE", "DOCUMENT",
] as const;
export type IntentClass = (typeof intentClasses)[number];

export const influenceClasses = [
  "CONSTRAIN", "REQUIRE", "FORBID", "SPECIALIZE", "REORDER", "ADD_GATE", "ADD_EVIDENCE", "SELECT_TOOL", "SELECT_METHOD", "ALLOCATE_DEPTH", "ALLOCATE_CONTEXT", "BRANCH", "CHANGE_OUTPUT", "CHANGE_STOP_CONDITION",
] as const;
export type InfluenceClass = (typeof influenceClasses)[number];

export const contextPriorities = ["P0", "P1", "P2", "P3", "P4"] as const;
export type ContextPriority = (typeof contextPriorities)[number];

export const authorityGates = ["READ_ONLY", "PREAUTHORIZED", "USER_DECISION_REQUIRED", "EXTERNAL_APPROVAL_REQUIRED"] as const;
export type AuthorityGate = (typeof authorityGates)[number];

export const evidenceSourceKinds = ["RUNTIME", "CI", "STATIC_ANALYSIS", "INDEPENDENT_REVIEW", "USER_AUTHORITY", "EXTERNAL"] as const;
export type EvidenceSourceKind = (typeof evidenceSourceKinds)[number];

export interface GoalContract {
  readonly version: string;
  readonly obligation: string;
  readonly requiredOutcomes: readonly string[];
  readonly prohibitedReinterpretations: readonly string[];
  readonly scope: readonly string[];
  readonly userChangeAuthorityRequired: boolean;
}

export interface IntentContract {
  readonly version: string;
  readonly classes: readonly IntentClass[];
  readonly obligations: readonly string[];
  readonly prohibitedWeakenings: readonly string[];
  readonly allowedSpecializations: readonly string[];
  readonly completionSemantics: readonly string[];
}

export interface ContextPrimitive {
  readonly id: string;
  readonly value: string;
  readonly provenance: string;
  readonly authority: string;
  readonly freshness: string;
  readonly evidenceStatus: "KNOWN" | "INFERRED" | "UNKNOWN" | "CONFLICTED" | "NOT_ACCESSIBLE";
  readonly priority: ContextPriority;
  readonly expectedInfluence: readonly InfluenceClass[];
}

export interface ContextContract {
  readonly version: string;
  readonly invariants: readonly string[];
  readonly constraints: readonly string[];
  readonly requiredEvidence: readonly string[];
  readonly prohibitedMethods: readonly string[];
  readonly preferredMethods: readonly string[];
  readonly environment: readonly string[];
  readonly toolCapabilities: readonly string[];
  readonly primitives: readonly ContextPrimitive[];
}

export interface Influence {
  readonly contextId: string;
  readonly effect: InfluenceClass;
  readonly target: string;
  readonly reason: string;
}

export interface PlanNode {
  readonly id: string;
  readonly objective: string;
  readonly intent: readonly IntentClass[];
  readonly executionPolicy: string;
  readonly scope: readonly string[];
  readonly requiredContext: readonly string[];
  readonly evidenceGate: readonly string[];
  readonly mutationPolicy: "READ_ONLY" | "QUARANTINE_ONLY" | "APPROVED_WRITE";
  readonly dependencies: readonly string[];
  readonly acceptance: readonly string[];
  readonly authorityGate: AuthorityGate;
  readonly riskAuthorityBoundary: string;
}

export interface EvidenceReceipt {
  readonly requirementId: string;
  readonly sourceKind: EvidenceSourceKind;
  readonly sourceLocator: string;
  readonly provenance: string;
  readonly status: "PASS" | "FAIL";
  readonly observedAt: string;
}

export interface EvaluationContract {
  readonly version: string;
  readonly acceptanceTests: readonly string[];
  readonly adversarialTests: readonly string[];
  readonly independentReviewRequired: boolean;
}

export interface CompiledCapability {
  readonly id: string;
  readonly version: string;
  readonly lifecycle: "PROVISIONAL" | "VERIFIED" | "DEPRECATED";
  readonly contractHash: string;
  readonly influenceHash: string;
  readonly compilerVersion: string;
  readonly taxonomyVersion: string;
  readonly sourceComponents: readonly string[];
  readonly executionGraph: readonly string[];
  readonly invariants: readonly string[];
  readonly allowedBranches: readonly string[];
  readonly forbiddenActions: readonly string[];
  readonly inputSchemaId: string;
  readonly outputSchemaId: string;
  readonly evaluation: EvaluationContract;
  readonly environmentAdapters: readonly string[];
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

export function canonicalHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(value))).digest("hex");
}

export function validateContextInfluence(context: ContextContract, influences: readonly Influence[]): readonly string[] {
  const influenced = new Set(influences.map((item) => item.contextId));
  return context.primitives
    .filter((primitive) => (primitive.priority === "P0" || primitive.priority === "P1") && primitive.expectedInfluence.length > 0 && !influenced.has(primitive.id))
    .map((primitive) => `Decision-critical context is mechanically inert: ${primitive.id}`);
}

export function validateCriticalContextReadiness(context: ContextContract): readonly string[] {
  return context.primitives
    .filter((primitive) => (primitive.priority === "P0" || primitive.priority === "P1") && primitive.evidenceStatus !== "KNOWN")
    .map((primitive) => `Decision-critical context is not KNOWN: ${primitive.id} (${primitive.evidenceStatus})`);
}

export function validateIntentMonotonicity(goal: GoalContract, upstream: IntentContract, downstream: IntentContract): readonly string[] {
  const errors: string[] = [];
  const downstreamObligations = new Set(downstream.obligations);
  for (const obligation of upstream.obligations) if (!downstreamObligations.has(obligation)) errors.push(`Intent obligation weakened or removed: ${obligation}`);
  for (const outcome of goal.requiredOutcomes) if (!downstreamObligations.has(outcome)) errors.push(`Goal outcome absent from downstream intent: ${outcome}`);
  const downstreamWeakenings = new Set(downstream.prohibitedWeakenings);
  for (const weakening of upstream.prohibitedWeakenings) if (!downstreamWeakenings.has(weakening)) errors.push(`Prohibited weakening removed: ${weakening}`);
  return errors;
}

export function validateEnvironmentParity(capability: CompiledCapability, observedAdapters: readonly string[]): readonly string[] {
  const observed = new Set(observedAdapters);
  return capability.environmentAdapters
    .filter((adapter) => !observed.has(adapter))
    .map((adapter) => `Declared environment adapter not observed: ${adapter}`);
}

export function normalizeIntent(contract: IntentContract): IntentContract {
  const uniqueSorted = (items: readonly string[]) => [...new Set(items.map((item) => item.trim()).filter(Boolean))].sort();
  return {
    ...contract,
    classes: [...new Set(contract.classes)].sort() as IntentClass[],
    obligations: uniqueSorted(contract.obligations),
    prohibitedWeakenings: uniqueSorted(contract.prohibitedWeakenings),
    allowedSpecializations: uniqueSorted(contract.allowedSpecializations),
    completionSemantics: uniqueSorted(contract.completionSemantics),
  };
}
