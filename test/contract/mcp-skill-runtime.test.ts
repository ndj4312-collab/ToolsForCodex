import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

function textPayload(result: { content?: Array<{ type: string; text?: string }> }): string {
  const text = result.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("MCP tool result did not contain text content");
  return text;
}

describe("registered MCP skill runtime", () => {
  jest.setTimeout(30_000);

  it("discovers and loads idealize through the actual MCP tool registry", async () => {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", "src/mcp/server.ts"],
      cwd: process.cwd(),
      stderr: "pipe",
    });
    const client = new Client({ name: "toolsforcodex-runtime-acceptance", version: "1.0.0" });

    try {
      await client.connect(transport);

      const listed = await client.listTools();
      const toolNames = listed.tools.map((tool) => tool.name);
      expect(toolNames).toEqual(expect.arrayContaining(["find_skills", "load_skill"]));

      const found = await client.callTool({
        name: "find_skills",
        arguments: {
          configPath: "orchestrator.config.example.json",
          query: "idealize",
          limit: 10,
        },
      });
      expect(found.isError).not.toBe(true);
      const matches = JSON.parse(textPayload(found)) as Array<{ name: string; path: string }>;
      expect(matches.some((match) => match.name === "idealize" && match.path === "skills/idealize-system/idealize/SKILL.md")).toBe(true);

      const loaded = await client.callTool({
        name: "load_skill",
        arguments: {
          configPath: "orchestrator.config.example.json",
          name: "idealize",
        },
      });
      expect(loaded.isError).not.toBe(true);
      const skill = JSON.parse(textPayload(loaded)) as { name: string; path: string; content: string };
      expect(skill.name).toBe("idealize");
      expect(skill.path).toBe("skills/idealize-system/idealize/SKILL.md");
      expect(skill.content).toContain("# Idealize");
      expect(skill.content).toContain("Repository promotion and live MCP proof are separate terminal gates");
    } finally {
      await client.close();
    }
  });
});
