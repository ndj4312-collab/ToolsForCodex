import type { CoverageCounters, CoverageReport } from "./types";

export function evaluateIngestionCoverage(counters: CoverageCounters): CoverageReport {
  const failures: string[] = [];

  if (counters.manifestDiscovered !== counters.sourceItemsAccounted) {
    failures.push("manifest_discovered != source_items_accounted");
  }
  if (counters.sourceItemsUnread !== 0) failures.push("source_items_unread != 0");
  if (counters.capabilityCandidatesUndispositioned !== 0) {
    failures.push("capability_candidates_undispositioned != 0");
  }
  if (counters.acceptedUsefulCapabilitiesWithoutRouteOrExplicitRouteBlocker !== 0) {
    failures.push("accepted_useful_capabilities_without_route_or_explicit_route_blocker != 0");
  }
  if (counters.activeRoutesWithoutAcceptanceEvidence !== 0) {
    failures.push("active_routes_without_acceptance_evidence != 0");
  }
  if (counters.newMandatoryMachineryWithoutSpecTicketsImplementationAcceptance !== 0) {
    failures.push("new_mandatory_machinery_without_spec_tickets_implementation_acceptance != 0");
  }
  if (counters.orphanCapabilitiesWithoutSourceProvenance !== 0) {
    failures.push("orphan_capabilities_without_source_provenance != 0");
  }
  if (counters.bulkPreserveObserveRevisitWithoutItemSpecificReason !== 0) {
    failures.push("bulk_preserve_observe_revisit_without_item_specific_reason != 0");
  }
  if (counters.wikiIntegrityFailures !== 0) failures.push("wiki_integrity_failures != 0");

  return { complete: failures.length === 0, failures, counters };
}

export function assertIngestionComplete(counters: CoverageCounters): void {
  const report = evaluateIngestionCoverage(counters);
  if (!report.complete) {
    throw new Error(`Ingestion incomplete: ${report.failures.join("; ")}`);
  }
}
