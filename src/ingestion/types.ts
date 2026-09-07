export type IngestionState =
  | "DISCOVERED"
  | "MANIFESTED"
  | "CLASSIFIED"
  | "QUEUED"
  | "READ"
  | "EXTRACTED"
  | "COMPARED"
  | "FAMILY_ASSIGNED"
  | "DISPOSITIONED"
  | "ROUTE_DECIDED"
  | "IMPLEMENTATION_DECIDED"
  | "VERIFIED"
  | "REJECTED"
  | "BLOCKED";

export type SourceItemKind =
  | "primitive"
  | "component"
  | "workflow"
  | "subsystem"
  | "runtime"
  | "methodology"
  | "standard"
  | "harness"
  | "evaluator"
  | "reference"
  | "native"
  | "unknown";

export interface Provenance {
  sourceId: string;
  sourceRevision: string;
  path: string;
}

export interface SourceItemRecord {
  id: string;
  provenance: Provenance;
  kind: SourceItemKind;
  state: IngestionState;
  readComplete: boolean;
  blockedReason?: string;
  resumptionPointer?: string;
}

export interface CapabilityCandidate {
  id: string;
  sourceItemIds: string[];
  purpose: string;
  triggers: string[];
  uniqueMechanisms: string[];
  dispositioned: boolean;
  disposition?: "ACCEPT" | "REJECT" | "PRESERVE" | "OBSERVE" | "REVISIT";
  dispositionReason?: string;
  revisitTrigger?: string;
}

export interface CoverageCounters {
  manifestDiscovered: number;
  sourceItemsAccounted: number;
  sourceItemsUnread: number;
  capabilityCandidatesUndispositioned: number;
  acceptedUsefulCapabilitiesWithoutRouteOrExplicitRouteBlocker: number;
  activeRoutesWithoutAcceptanceEvidence: number;
  newMandatoryMachineryWithoutSpecTicketsImplementationAcceptance: number;
  orphanCapabilitiesWithoutSourceProvenance: number;
  bulkPreserveObserveRevisitWithoutItemSpecificReason: number;
  wikiIntegrityFailures: number;
}

export interface CoverageReport {
  complete: boolean;
  failures: string[];
  counters: CoverageCounters;
}
