import { assertIngestionComplete, evaluateIngestionCoverage } from "../../src/ingestion/coverage";
import type { CoverageCounters } from "../../src/ingestion/types";

function passingCounters(): CoverageCounters {
  return {
    manifestDiscovered: 5000,
    sourceItemsAccounted: 5000,
    sourceItemsUnread: 0,
    capabilityCandidatesUndispositioned: 0,
    acceptedUsefulCapabilitiesWithoutRouteOrExplicitRouteBlocker: 0,
    activeRoutesWithoutAcceptanceEvidence: 0,
    newMandatoryMachineryWithoutSpecTicketsImplementationAcceptance: 0,
    orphanCapabilitiesWithoutSourceProvenance: 0,
    bulkPreserveObserveRevisitWithoutItemSpecificReason: 0,
    wikiIntegrityFailures: 0
  };
}

describe("ingestion coverage gates", () => {
  test("passes only when every hard completion equation passes", () => {
    const report = evaluateIngestionCoverage(passingCounters());
    expect(report.complete).toBe(true);
    expect(report.failures).toEqual([]);
  });

  test("regression: thousands discovered cannot collapse to a handful accounted", () => {
    const counters = passingCounters();
    counters.sourceItemsAccounted = 3;
    const report = evaluateIngestionCoverage(counters);
    expect(report.complete).toBe(false);
    expect(report.failures).toContain("manifest_discovered != source_items_accounted");
  });

  test("unread items hard-fail exhaustive completion", () => {
    const counters = passingCounters();
    counters.sourceItemsUnread = 1;
    expect(() => assertIngestionComplete(counters)).toThrow("source_items_unread != 0");
  });

  test("bulk preserve/observe/revisit without item-specific reasons hard-fails", () => {
    const counters = passingCounters();
    counters.bulkPreserveObserveRevisitWithoutItemSpecificReason = 1;
    expect(evaluateIngestionCoverage(counters).complete).toBe(false);
  });

  test("active routes without acceptance evidence hard-fail", () => {
    const counters = passingCounters();
    counters.activeRoutesWithoutAcceptanceEvidence = 1;
    expect(evaluateIngestionCoverage(counters).complete).toBe(false);
  });
});
