# matt-skill-contract-audit

## What it does

Checks invocation parity, descriptions, owned references, `/skill-name` dependencies, lifecycle, routing, and distribution consistency.

## When to reach for it

Invoke it when a skill needs autonomous compatibility validation before patching or release.

## Common questions

### What happens when evidence is missing?

The validator reports `UNKNOWN` with the evidence needed to resolve it and blocks unsafe continuation.

### Does it apply fixes?

No. It produces findings only.

## It's working if

Each rule has a deterministic pass/fail/unknown result and a source locator.
