---
name: standardize-skills-to-matt-pocock
description: Prepare a reviewed patch that standardizes a skill to the Matt-style compatibility contract.
disable-model-invocation: true
---

# Standardize Skills to Matt Pocock

Use this user-invoked controller to prepare a reviewed, reversible patch candidate for one skill. Begin with explicit preflight and audit the source without executing it. Preserve the source and represent any missing information as `UNKNOWN` with the evidence needed to resolve it.

The controller may invoke only `/matt-skill-contract-audit`. It may not invoke another user-invoked skill. Do not apply, install, delete, or globally synchronize anything implicitly.
