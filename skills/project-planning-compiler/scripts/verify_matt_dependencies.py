#!/usr/bin/env python3
"""Verify exact vendored Matt Pocock planning dependencies and lock provenance."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any


EXPECTED: dict[str, dict[str, str]] = {
    "to-spec": {
        "runtime_path": ".agents/skills/to-spec/SKILL.md",
        "git_blob_sha": "3fd64959895b7eb095a13d797e1c7544f1f08c8f",
        "source": "mattpocock/skills",
        "sourceType": "github",
        "skillPath": "skills/engineering/to-spec/SKILL.md",
        "computedHash": "144cf30cf527faff7f9211ae81ad3de5aaa6390f639b87ca5a48f5e818a8d33e",
    },
    "to-tickets": {
        "runtime_path": ".agents/skills/to-tickets/SKILL.md",
        "git_blob_sha": "96deac51d4391a3f691478d48f85f43261516c08",
        "source": "mattpocock/skills",
        "sourceType": "github",
        "skillPath": "skills/engineering/to-tickets/SKILL.md",
        "computedHash": "e817ecc8ffbb51dd5edd7cc141fe209f31c298dfd66b886e0c6c9aba2dd70266",
    },
}


class VerificationError(Exception):
    pass


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def verify(root: Path, expected: dict[str, dict[str, str]] = EXPECTED) -> dict[str, Any]:
    lock_path = root / "skills-lock.json"
    if not lock_path.is_file():
        raise VerificationError(f"missing lockfile: {lock_path}")

    try:
        lock = json.loads(lock_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise VerificationError(f"cannot read lockfile: {exc}") from exc

    skills = lock.get("skills")
    if not isinstance(skills, dict):
        raise VerificationError("skills-lock.json must contain an object at skills")

    evidence: list[dict[str, str]] = []

    for name, pin in expected.items():
        runtime_path = root / pin["runtime_path"]
        if not runtime_path.is_file():
            raise VerificationError(f"{name}: missing vendored runtime file {pin['runtime_path']}")

        try:
            data = runtime_path.read_bytes()
        except OSError as exc:
            raise VerificationError(f"{name}: cannot read runtime file: {exc}") from exc

        observed_blob = git_blob_sha(data)
        if observed_blob != pin["git_blob_sha"]:
            raise VerificationError(
                f"{name}: vendored bytes drifted: expected git blob {pin['git_blob_sha']}, observed {observed_blob}"
            )

        record = skills.get(name)
        if not isinstance(record, dict):
            raise VerificationError(f"{name}: missing lockfile record")

        for field in ("source", "sourceType", "skillPath", "computedHash"):
            observed = record.get(field)
            if observed != pin[field]:
                raise VerificationError(
                    f"{name}: lock provenance mismatch for {field}: expected {pin[field]!r}, observed {observed!r}"
                )

        evidence.append(
            {
                "skill": name,
                "runtime_path": pin["runtime_path"],
                "git_blob_sha": observed_blob,
                "lock_computed_hash": str(record["computedHash"]),
                "source": str(record["source"]),
            }
        )

    return {"valid": True, "dependencies": evidence}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[3],
        help="repository root (defaults to the repo containing this script)",
    )
    args = parser.parse_args()

    try:
        result = verify(args.root.resolve())
    except VerificationError as exc:
        print(json.dumps({"valid": False, "error": str(exc)}, indent=2, sort_keys=True))
        return 1

    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
