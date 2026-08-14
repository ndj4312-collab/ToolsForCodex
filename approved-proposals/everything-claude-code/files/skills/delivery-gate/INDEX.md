# Skills index

Generated from observed SKILL.md files.

Source digest: `fccd8a3ce69072f7ed5e7d960aa19b817b3dac45d13f48ad9cd7332ab6ec43bd`

- `/delivery-gate` — `skills/delivery-gate/SKILL.md` — Stop hook that blocks Claude from finishing until quality checks pass. Detects rationalization patterns (surface text heuristics), stale learning logs (filesystem mtime), and low disk space. Complements self-audit by mechanically enforcing learning capture habits. Use when Claude should be mechanically blocked from declaring work finished before quality checks and learning capture actually pass.
