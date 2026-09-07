# Approved Proposal Endurance Effect Validation

Status: **FAIL — configured, not runtime-enforced**

Scope: 456 approved-proposal capabilities previously marked `ENDURE ACTIVE` and `WIKI ACTIVE`.

## What was validated

1. Lifecycle generation: PASS. `scripts/promote-approved-proposals.mjs` creates per-item spec, ticket, implementation, acceptance, endure, wiki, and active-route records for all 456 items.
2. CI lifecycle completeness: PASS. GitHub Actions fails if any of the 456 lifecycle records lacks a terminal lifecycle stage.
3. Source provenance/hash/read checks: PASS.
4. Durable active-route registry generation: PASS.
5. Automatic runtime consumption of the active-route registry during normal task routing: **FAIL / not implemented**.
6. Bootstrap integration: **FAIL**. `src/bootstrap/generate.ts` builds available-skill instructions from the supplied `SkillIr[]`; it does not read `APPROVED_PROPOSAL_ACTIVE_ROUTES.json`.
7. Invocation-effect evidence: **FAIL**. No accepted runtime consumer was found that evaluates a task against the 456 endured trigger contracts and forces matching capabilities into the execution assembly.

## Actual effect of endurance at validation time

The endurance layer currently has these real effects:
- preserves per-item lifecycle/provenance records;
- produces 456 route declarations;
- provides CI protection against lifecycle-record omission;
- exposes lazy wiki pointers and metadata.

It does **not yet** prove or enforce these effects:
- automatic trigger evaluation on every applicable task;
- forced loading/invocation of a matching capability;
- completion blocking when a matched capability was skipped;
- runtime receipt proving the matched capability actually executed.

## Required correction before ACTIVE may be claimed

A runtime resolver/consumer must:
1. load the 456 accepted/endured route declarations;
2. evaluate their triggers for each meaningful task;
3. inject every matched capability into the execution assembly as REQUIRED;
4. record invocation evidence per matched route;
5. block VERIFIED completion when a required match lacks execution evidence;
6. integrate with bootstrap/runtime entrypoints rather than rely on registry presence;
7. pass positive-match, negative-match, overlap, ambiguity, and skipped-required-route tests across the full 456-route registry.

Until those gates pass, the correct semantic state is **CONFIGURED / NOT RUNTIME-ENFORCED**, not ACTIVE endurance.
