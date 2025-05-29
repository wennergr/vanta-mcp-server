import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { baseApiUrl } from "../api.js";
import { Tool } from "../types.js";
import { z } from "zod";
import { createAuthHeaders } from "./utils.js";

const GetFrameworksInput = z.object({
  pageSize: z.number().optional(),
  pageCursor: z.string().optional(),
});

export const GetFrameworksTool: Tool<typeof GetFrameworksInput> = {
  name: "get_frameworks",
  description:
    "List all compliance frameworks available in your Vanta account (SOC 2, ISO 27001, HIPAA, GDPR, FedRAMP, PCI, etc.) along with completion status and progress metrics. Shows which frameworks you're actively pursuing and their current compliance state including status of controls, documents, and tests for each framework.",
  parameters: GetFrameworksInput,
};

const GetFrameworkControlsInput = z.object({
  frameworkId: z.string(),
  pageSize: z.number().optional(),
  pageCursor: z.string().optional(),
});

export const GetFrameworkControlsTool: Tool<typeof GetFrameworkControlsInput> =
  {
    name: "get_framework_controls",
    description:
      "Get the detailed CONTROL REQUIREMENTS for a specific framework (requires frameworkId). Use this when you need the specific control details, requirements, and implementation guidance for a known framework like 'soc2' or 'iso27001'. This returns the actual security controls and their descriptions, NOT the framework list. Use get_frameworks first if you need to see available frameworks.",
    parameters: GetFrameworkControlsInput,
  };

export async function getFrameworkControls(
  args: z.infer<typeof GetFrameworkControlsInput>,
): Promise<CallToolResult> {
  const url = new URL(
    `/v1/frameworks/${args.frameworkId}/controls`,
    baseApiUrl(),
  );
  if (args.pageSize !== undefined) {
    url.searchParams.append("pageSize", args.pageSize.toString());
  }
  if (args.pageCursor !== undefined) {
    url.searchParams.append("pageCursor", args.pageCursor);
  }

  const headers = createAuthHeaders();

  const response = await fetch(url.toString(), {
    headers,
  });
  if (!response.ok) {
    return {
      content: [
        { type: "text" as const, text: `Error: ${response.statusText}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(await response.json()) },
    ],
  };
}

export async function getFrameworks(
  args: z.infer<typeof GetFrameworksInput>,
): Promise<CallToolResult> {
  const url = new URL("/v1/frameworks", baseApiUrl());
  if (args.pageSize !== undefined) {
    url.searchParams.append("pageSize", args.pageSize.toString());
  }
  if (args.pageCursor !== undefined) {
    url.searchParams.append("pageCursor", args.pageCursor);
  }
  const headers = createAuthHeaders();

  const response = await fetch(url.toString(), {
    headers,
  });

  if (!response.ok) {
    return {
      content: [
        { type: "text" as const, text: `Error: ${response.statusText}` },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(await response.json()) },
    ],
  };
}
