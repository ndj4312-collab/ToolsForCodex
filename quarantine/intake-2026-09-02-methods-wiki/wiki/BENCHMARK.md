# Wiki / MCP Traversal Experiment

## Threshold
Promote only if a representative batch shows >=30% fewer discovery/context reads, or an equivalent material provenance/freshness gain, with zero wrong authority routing.

## Cold traversal microbenchmark
For a cold agent answering five cross-surface orientation questions, the current generic pattern is commonly:
AGENTS bootstrap + search then canonical fetch per unfamiliar question.
Approximate discovery/fetch operations: 1 + (2 * 5) = 11.

A precompiled knowledge map can route:
AGENTS bootstrap + one knowledge-map load + one canonical fetch per question.
Approximate operations: 1 + 1 + 5 = 7.

Projected reduction across this batch: 36%.

This is a routing microbenchmark, not a live MCP performance benchmark. Narrow questions already having a direct AGENTS locator may see zero improvement; a static wiki can even add overhead.

## Decision
Worth a bounded derived-map experiment. Do not blanket-convert the repo into wiki pages.
Next production hypothesis: `find_knowledge(query)` + `load_knowledge(id)` analogous to skill routing.
Promotion requires live MCP implementation/tests and repeated benchmark results.
