---
name: headroom-token-minimizer
description: Use when a workflow needs smaller prompts, tool outputs, evidence packs, or handoff context without losing audit-critical facts.
disable-model-invocation: false
---

# Headroom Token Minimizer

Use this model-invoked skill to shrink context before a batch, audit, repo intake, or MCP call when the working set is larger than the next agent needs. The goal is minimum sufficient context: preserve claims, provenance, decisions, hashes, paths, commands, failures, and open questions while replacing bulky raw material with stable pointers and compact evidence.

## What to preserve

Keep these exact, even when compressing everything around them:

- User instructions, constraints, approvals, refusals, and unresolved preferences.
- Repository names, branches, commit SHAs, file paths, package names, command names, tool names, URLs, and timestamps.
- Security, license, privacy, provenance, and execution-boundary findings.
- Test, lint, build, smoke, audit, and live-MCP verification outcomes.
- Claims that another model will audit, together with the evidence needed to check them.

Do not summarize authentication secrets, API keys, passwords, or personal data into the handoff. Record only that sensitive material existed and how it was handled.

## Compression workflow

1. Build a manifest first: identify files, tools, pages, commits, and external sources before reading deeply.
2. Classify each item as `raw-required`, `evidence-critical`, `lossy-summarizable`, or `pointer-only`.
3. Read only the smallest range needed for each claim. Prefer indexes, manifests, schemas, and registries before source bodies.
4. Produce a compact context pack with:
   - current goal and batch boundary;
   - canonical orientation files and ledger/status pointers;
   - changed files and SHAs;
   - verified claims with evidence handles;
   - unknowns, blockers, and the exact next action.
5. Keep raw excerpts short. If exact text is required, quote only the required line or field and point to the source.
6. Run a self-audit: check whether a non-participating model could reproduce the reasoning from the context pack and cited orientation files.

## Headroom-style adapter

This skill borrows the Headroom pattern of compressing material before it reaches the model, but it does not install, execute, vendor, or depend on an external Headroom repository. Treat external Headroom implementations as optional candidates that require the normal adding-repo protocol before use.

When MCP tools are available, verify discoverability with:

- `find_skills` using query `headroom token minimizer`
- `load_skill` using name `headroom-token-minimizer`

If those tools are not available in the current MCP environment, record the gap and fall back to the project catalog or static skill index.

## Stop conditions

Do not compress when the user asked for verbatim review, line-by-line editing, legal/security precision, or final code diff inspection unless a raw pointer remains available. Stop and request more evidence when compression would remove the only basis for a claim.
