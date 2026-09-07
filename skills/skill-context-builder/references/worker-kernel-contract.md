# Worker kernel and completion contract

Use this reference when compiling or validating worker packets.

## Worker kernel

```json
{
  "worker_id": "string",
  "role": "string",
  "stage": "string",
  "objective": "string",
  "target_surfaces": ["surface-id"],
  "reads": ["dependency-id"],
  "writes": ["dependency-id"],
  "waits_for": ["dependency-id"],
  "releases": ["dependency-id"],
  "blocked_by": ["dependency-id"],
  "downstream_consumers": ["worker-or-stage-id"],
  "current_state": {},
  "required_end_state": {},
  "allowed_mutations": [],
  "forbidden_mutations": [],
  "mechanism": "string",
  "evidence_required": []
}
```

## Completion record

```json
{
  "worker_id": "string",
  "role": "string",
  "stage": "string",
  "assigned_targets": [],
  "completed_targets": [],
  "observed_mutations": [],
  "unchanged_targets": [],
  "evidence": [],
  "blockers": [],
  "remaining_targets": [],
  "dependency_updates": [],
  "outcome": "SUCCEEDED|PARTIAL|FAILED"
}
```

A worker self-report is evidence metadata, not proof by itself. Reconcile completion records against observable state before promoting changes into canonical context.
