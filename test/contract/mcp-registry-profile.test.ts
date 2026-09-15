import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

function textPayload(result: unknown): string {
  if (!result || typeof result !== "object" || !("content" in result) || !Array.isArray(result.content)) {
    throw new Error("MCP tool result did not contain a content array");
  }
  for (const item of result.content) {
    if (item && typeof item === "object" && "type" in item && item.type === "text" && "text" in item && typeof item.text === "string") {
      return item.text;
    }
  }
  throw new Error("MCP tool result did not contain text content");
}

async function connect(entrypoint: string, name: string): Promise<{ client: Client; tools: unknown[] }> {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["--import", "tsx", entrypoint],
    cwd: process.cwd(),
    stderr: "pipe",
  });
  const client = new Client({ name, version: "1.0.0" });
  await client.connect(transport);
  const listed = await client.listTools();
  return { client, tools: listed.tools };
}

describe("registry-only MCP profile", () => {
  jest.setTimeout(30_000);

  it("exposes exactly find_skills/load_skill and preserves deterministic registry behavior", async () => {
    const { client, tools } = await connect("src/mcp/registry-server.ts", "toolsforcodex-registry-profile");
    try {
      expect(tools.map((tool: any) => tool.name)).toEqual(["find_skills", "load_skill"]);

      const args = { configPath: "orchestrator.config.example.json", query: "idealize", limit: 10 };
      const first = await client.callTool({ name: "find_skills", arguments: args });
      const second = await client.callTool({ name: "find_skills", arguments: args });
      expect("isError" in first ? first.isError : false).not.toBe(true);
      expect(textPayload(second)).toBe(textPayload(first));

      const matches = JSON.parse(textPayload(first)) as Array<{ name: string; path: string }>;
      expect(matches.some((match) => match.name === "idealize" && match.path === "skills/idealize-system/idealize/SKILL.md")).toBe(true);

      const loaded = await client.callTool({
        name: "load_skill",
        arguments: { configPath: "orchestrator.config.example.json", name: "idealize" },
      });
      expect("isError" in loaded ? loaded.isError : false).not.toBe(true);
      const skill = JSON.parse(textPayload(loaded)) as { name: string; path: string; content: string };
      expect(skill.name).toBe("idealize");
      expect(skill.path).toBe("skills/idealize-system/idealize/SKILL.md");
      expect(skill.content).toContain("# Idealize");

      const unsafe = await client.callTool({
        name: "load_skill",
        arguments: { configPath: "orchestrator.config.example.json", name: "../../outside/SKILL.md" },
      });
      expect("isError" in unsafe ? unsafe.isError : false).toBe(true);
    } finally {
      await client.close();
    }
  });

  it("has a smaller serialized tools/list surface than the broad MCP profile", async () => {
    const registry = await connect("src/mcp/registry-server.ts", "registry-schema-measure");
    const broad = await connect("src/mcp/server.ts", "broad-schema-measure");
    try {
      const registryBytes = Buffer.byteLength(JSON.stringify(registry.tools), "utf8");
      const broadBytes = Buffer.byteLength(JSON.stringify(broad.tools), "utf8");
      process.stdout.write(`VNT-005 tools/list bytes registry=${registryBytes} broad=${broadBytes}\n`);
      expect(registryBytes).toBeGreaterThan(0);
      expect(broadBytes).toBeGreaterThan(registryBytes);
    } finally {
      await registry.client.close();
      await broad.client.close();
    }
  });
});
