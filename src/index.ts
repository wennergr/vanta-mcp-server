import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getTests, GetTestsTool } from "./tests.js";

const server = new McpServer({
  name: "vanta-mcp",
  version: "1.0.0",
});

server.tool(
  GetTestsTool.name,
  GetTestsTool.description,
  GetTestsTool.parameters.shape,
  getTests,
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
