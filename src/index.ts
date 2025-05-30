import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  deactivateTestEntity,
  DeactivateTestEntityTool,
  getTestEntities,
  GetTestEntitiesTool,
  getTests,
  GetTestsTool,
} from "./operations/tests.js";
import {
  GetFrameworkControlsTool,
  GetFrameworksTool,
  getFrameworkControls,
  getFrameworks,
} from "./operations/frameworks.js";
import { UploadDocumentTool, uploadDocument } from "./operations/documents.js";
import {
  GetControlsTool,
  GetControlTestsTool,
  getControls,
  getControlTests,
} from "./operations/controls.js";
import { initializeToken } from "./auth.js";

const server = new McpServer({
  name: "vanta-mcp",
  version: "1.0.0",
  description:
    "Model Context Protocol server for Vanta's automated security compliance platform. Provides access to security tests, compliance frameworks, and documentation management for SOC 2, ISO 27001, HIPAA, GDPR and other standards.",
});

server.tool(
  GetTestsTool.name,
  GetTestsTool.description,
  GetTestsTool.parameters.shape,
  getTests,
);

server.tool(
  GetTestEntitiesTool.name,
  GetTestEntitiesTool.description,
  GetTestEntitiesTool.parameters.shape,
  getTestEntities,
);

server.tool(
  DeactivateTestEntityTool.name,
  DeactivateTestEntityTool.description,
  DeactivateTestEntityTool.parameters.shape,
  deactivateTestEntity,
);

server.tool(
  GetFrameworksTool.name,
  GetFrameworksTool.description,
  GetFrameworksTool.parameters.shape,
  getFrameworks,
);

server.tool(
  GetFrameworkControlsTool.name,
  GetFrameworkControlsTool.description,
  GetFrameworkControlsTool.parameters.shape,
  getFrameworkControls,
);

server.tool(
  GetControlsTool.name,
  GetControlsTool.description,
  GetControlsTool.parameters.shape,
  getControls,
);

server.tool(
  GetControlTestsTool.name,
  GetControlTestsTool.description,
  GetControlTestsTool.parameters.shape,
  getControlTests,
);

server.tool(
  UploadDocumentTool.name,
  UploadDocumentTool.description,
  UploadDocumentTool.parameters.shape,
  uploadDocument,
);

async function main() {
  try {
    await initializeToken();
    console.error("Token initialized successfully");
  } catch (error) {
    console.error("Failed to initialize token:", error);
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(error => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
