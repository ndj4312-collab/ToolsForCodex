import { findKnowledge, loadKnowledge, type KnowledgeMap } from "../src/knowledge/router";

const map: KnowledgeMap = {
  schema_version: 1,
  derived: true,
  canon_rule: "Canonical sources always win over derived material.",
  concepts: [
    {
      id: "repo-write-governance",
      queries: ["write repository", "transaction approval"],
      summary: "Repository mutation policy.",
      authority: "canonical repo policy",
      canonical_sources: ["AGENTS.md", "src/transactions/engine.ts"],
      freshness: "current main",
    },
    {
      id: "repo-intake",
      queries: ["external repository intake", "quarantine", "adding repo protocol"],
      summary: "External repository intake.",
      authority: "canonical repo protocol",
      canonical_sources: ["docs/adding-repo-protocol.md"],
      freshness: "current main",
    },
    {
      id: "mcp-skill-routing",
      queries: ["MCP skill discovery", "find skill", "load skill"],
      summary: "Skill routing.",
      authority: "runtime source",
      canonical_sources: ["src/mcp/server.ts", "src/mcp/skill-registry.ts"],
      freshness: "current verified main",
    },
    {
      id: "project-state",
      queries: ["project state", "canonical ledger", "handoff"],
      summary: "Durable project state.",
      authority: "Notion ledger",
      canonical_sources: ["Notion SECOND_BRAIN_AGENT_ENVIRONMENT_LEDGER"],
      derived_sources: ["derived wiki"],
      freshness: "session start",
      conflicts: ["Derived wiki is stale; canonical ledger wins."],
    },
    {
      id: "release-validation",
      queries: ["release validation", "npm pack", "runtime health"],
      summary: "Release acceptance.",
      authority: "runtime scripts",
      canonical_sources: ["scripts/validate-release.mjs", ".github/workflows/ci.yml"],
      freshness: "current commit",
    },
    {
      id: "method-routing",
      queries: ["planning depth", "methodology routing", "BMAD FABLE"],
      summary: "Method selection.",
      authority: "methodology guidance only",
      canonical_sources: ["Notion BMAD_EXPANDED_METHODOLOGY.md"],
      freshness: "reviewed method canon",
    },
  ],
};

describe("knowledge router", () => {
  test.each([
    ["repository write transaction approval", "repo-write-governance"],
    ["external repository intake quarantine", "repo-intake"],
    ["MCP skill discovery find skill", "mcp-skill-routing"],
    ["where project state canonical ledger lives", "project-state"],
    ["release validation npm pack runtime health", "release-validation"],
    ["BMAD planning depth methodology routing", "method-routing"],
  ])("routes %s to %s", (query, expected) => {
    expect(findKnowledge(map, query)[0]?.id).toBe(expected);
  });

  test("ambiguous query is deterministic and preserves alternatives", () => {
    const first = findKnowledge(map, "repository protocol", 5);
    const second = findKnowledge(map, "repository protocol", 5);
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(1);
  });

  test("stale/conflicting derived source never outranks canonical source", () => {
    const loaded = loadKnowledge(map, "project-state");
    expect(loaded.derived).toBe(true);
    expect(loaded.canon_rule).toMatch(/Canonical sources always win/i);
    expect(loaded.canonical_sources).toEqual(["Notion SECOND_BRAIN_AGENT_ENVIRONMENT_LEDGER"]);
    expect(loaded.conflicts?.[0]).toMatch(/canonical ledger wins/i);
  });

  test("unknown ids fail closed", () => {
    expect(() => loadKnowledge(map, "does-not-exist")).toThrow("Unknown knowledge id: does-not-exist");
  });
});
