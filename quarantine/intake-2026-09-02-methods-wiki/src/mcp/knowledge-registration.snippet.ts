// Patch candidate only; wire through the same local/remote MCP registration pattern.
// Read-only: these tools return a derived routing projection and never mutate target/canon.

server.registerTool(
  "find_knowledge",
  {
    title: "Find knowledge",
    description: "Rank derived knowledge-map entries and return exact canonical source locators. Read-only.",
    inputSchema: { query: z.string(), limit: z.number().int().min(1).max(20).optional() },
  },
  async ({ query, limit }) => guarded(() => findKnowledge(loadKnowledgeMap(targetRoot), query, limit)),
);

server.registerTool(
  "load_knowledge",
  {
    title: "Load knowledge",
    description: "Load one derived knowledge entry with authority/freshness/conflicts and canonical sources to open next. Read-only.",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => guarded(() => loadKnowledge(loadKnowledgeMap(targetRoot), id)),
);
