# /ingest-and-endure

Deterministic exhaustive capability assimilation for repositories, skill libraries, playbooks, runtimes, methods, standards, evaluators, and mixed corpora.

## Invocation

`/ingest-and-endure <source>`

If a source is supplied, preserve its identity and revision before decomposition. If no source is supplied, discover the strongest relevant authorized source corpus first.

## Non-negotiable invariant

`DISCOVER ALL → INVENTORY ALL → ACCOUNT FOR ALL → READ/EXTRACT TO REQUIRED DEPTH → DISPOSITION ALL → DEDUPLICATE → FORM CAPABILITY FAMILIES → VERIFY EXISTING FUNCTIONALITY → ROUTE EXISTING WORKING CAPABILITIES → SPEC/TICKET/IMPLEMENT/ACCEPT MISSING MACHINERY → ENDURE RECURRING PROCEDURES → RECONCILE WIKI/CANON → AUDIT COVERAGE → RUN IMPROVEMENT LOOP → REPEAT UNTIL EXIT CRITERIA PASS`

## Hard rules

1. The denominator is the complete discovered manifest for the pinned source revision. Batching may reduce working-set size but MUST NOT redefine the denominator.
2. Every source item receives a stable record and terminal accounting state. No discovered item may disappear because it appears redundant, low-value, generated, malformed, or inconvenient.
3. `UNKNOWN` is a valid intermediate state and is never equivalent to skipped or complete.
4. A source item cannot be COMPLETE unless it has been read to the depth required by its classifier. Externally unreadable items become BLOCKED with evidence and a resumption pointer.
5. Every materially unique capability candidate receives an explicit disposition. PRESERVE, OBSERVE, and REVISIT require item-specific reasons and a future trigger or unresolved question.
6. Similarity is not permission to collapse. Exact duplicate, near duplicate, specialization, superset, complementary composition, unique primitive/evaluator/workflow, and unresolved overlap are distinct outcomes. All merged families retain member IDs, provenance, and preserved distinctions.
7. Assimilation and implementation are separate gates. Existing working native capabilities route directly after verification. Only missing or changed operational machinery enters `/to-spec → /to-tickets → /implement → acceptance`.
8. No new or changed mandatory mechanism may become ACTIVE before acceptance evidence exists.
9. `/endure` is invoked only after the procedure or enforcing mechanism is implemented and accepted. Endurance must create multiple independent enforcing authorities where applicable.
10. Never claim exhaustive ingestion while any completion equation fails.

## Required record classes

Use the canonical ingestion contract to represent at least: CorpusManifest, SourceItemRecord, CapabilityCandidate, CapabilityFamily, DispositionRecord, RouteCandidate, ImplementationGap, CoverageReport, IngestionReceipt, ImprovementRecord.

## Deterministic state machine

`DISCOVERED → MANIFESTED → CLASSIFIED → QUEUED → READ → EXTRACTED → COMPARED → FAMILY_ASSIGNED → DISPOSITIONED → ROUTE_DECIDED → IMPLEMENTATION_DECIDED → VERIFIED | REJECTED | BLOCKED`

A transition must preserve provenance and evidence. Invalid backward/sideways transitions fail closed unless a new source revision explicitly invalidates prior evidence.

## Required extraction fields

For every relevant item extract, when present: triggers, purpose, prerequisites, ordered steps, branches, outputs, reads/writes, standards, evaluators, failure modes, reusable primitives, composition rules, native invocation, provenance, and unique mechanisms.

## Coverage gates

The run cannot complete unless all are true:

1. `manifest_discovered = source_items_accounted`
2. `source_items_unread = 0`
3. `capability_candidates_undispositioned = 0`
4. `accepted_useful_capabilities_without_route_or_explicit_route_blocker = 0`
5. `active_routes_without_acceptance_evidence = 0`
6. `new_mandatory_machinery_without_spec_tickets_implementation_acceptance = 0`
7. `orphan_capabilities_without_source_provenance = 0`
8. `bulk_preserve_observe_revisit_without_item_specific_reason = 0`
9. `wiki_integrity_failures = 0`

The executable coverage evaluator in `src/ingestion/coverage.ts` is authoritative for machine evaluation of these gates.

## Anti-cheat failures

Hard-fail the run when any of the following occurs: count mismatch, orphan item/candidate, bulk unjustified disposition, ACTIVE route without acceptance evidence, missing provenance, claimed exhaustive with unread items, batch denominator narrowing, or terminal completion with an unresolved hard gate.

## Improvement loop

After the ingestion pass:

`MEASURE → FIND MISSES/OVERMERGES/UNDERMERGES/ROUTE FAILURES/UNNECESSARY IMPLEMENTATIONS → ROOT-CAUSE → PROPOSE RULE/SCHEMA/EXTRACTOR/EVAL CHANGE → /to-spec → /to-tickets → /implement → regression test → compare benchmark → promote only if strict functional superset → /endure accepted recurring rule`

Every accepted improvement adds a regression test/evaluator. Stop iterating when all hard gates pass and the latest iteration yields no accepted correctness/coverage improvement above the configured threshold or only lower-value optimization remains.

## Mandatory adversarial fixtures

The acceptance suite must cover: thousands of near-duplicates; nested trees; wrappers hiding unique evaluators; malformed metadata; one unique line inside a near duplicate; external methods; generated files; docs-only items; huge resumable batching; interrupted runs; and source revision change mid-run.

Regression fixture: a corpus with thousands of source items that produces only a handful of additions without per-item accounting MUST fail, never report success.

## Completion output

Return counts for discovered, processed, terminally accounted, unread/partial, candidates, unique candidates, families, duplicates/merges, useful accepted, directly routable existing, composites, implementation gaps, implemented/accepted additions, endured procedures, rejected, revisit+triggers, UNKNOWN, trace coverage, and route coverage. Include blockers/resumption pointers when incomplete.