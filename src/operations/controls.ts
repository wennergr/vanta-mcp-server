import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { baseApiUrl } from "../api.js";
import { Tool } from "../types.js";
import { z } from "zod";
import { makeAuthenticatedRequest } from "./utils.js";

const GetControlsInput = z.object({
  pageSize: z
    .number()
    .describe("Number of controls to return (1-100, default 10)")
    .optional(),
  pageCursor: z.string().describe("Pagination cursor for next page").optional(),
  frameworkMatchesAny: z
    .array(z.string())
    .describe("Filter controls by framework IDs. Returns controls that belong to any of the specified frameworks, e.g. ['soc2', 'iso27001', 'hipaa']")
    .optional(),
});

export const GetControlsTool: Tool<typeof GetControlsInput> = {
  name: "get_controls",
  description:
    "List all security controls across all frameworks in your Vanta account. Returns control names, descriptions, framework mappings, and current implementation status. Use this to see all available controls or to find a specific control ID for use with other tools. Optionally filter by specific frameworks using frameworkMatchesAny.",
  parameters: GetControlsInput,
};

const GetControlTestsInput = z.object({
  controlId: z
    .string()
    .describe(
      "Control ID to get tests for, e.g. 'access-control-1' or 'data-protection-2'",
    ),
  pageSize: z
    .number()
    .describe("Number of tests to return (1-100, default 10)")
    .optional(),
  pageCursor: z.string().describe("Pagination cursor for next page").optional(),
});

export const GetControlTestsTool: Tool<typeof GetControlTestsInput> = {
  name: "get_control_tests",
  description:
    "Get all automated tests that validate a specific security control. Use this when you know a control ID and want to see which specific tests monitor compliance for that control. Returns test details, current status, and any failing entities for the control's tests.",
  parameters: GetControlTestsInput,
};

export async function getControls(
  args: z.infer<typeof GetControlsInput>,
): Promise<CallToolResult> {
  const url = new URL("/v1/controls", baseApiUrl());

  if (args.pageSize !== undefined) {
    url.searchParams.append("pageSize", args.pageSize.toString());
  }
  if (args.pageCursor !== undefined) {
    url.searchParams.append("pageCursor", args.pageCursor);
  }
  if (args.frameworkMatchesAny !== undefined) {
    args.frameworkMatchesAny.forEach(framework => {
      url.searchParams.append("frameworkMatchesAny", framework);
    });
  }

  const response = await makeAuthenticatedRequest(url.toString());

  if (!response.ok) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${response.statusText}`,
        },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(await response.json()) },
    ],
  };
}

export async function getControlTests(
  args: z.infer<typeof GetControlTestsInput>,
): Promise<CallToolResult> {
  const url = new URL(`/v1/controls/${args.controlId}/tests`, baseApiUrl());

  if (args.pageSize !== undefined) {
    url.searchParams.append("pageSize", args.pageSize.toString());
  }
  if (args.pageCursor !== undefined) {
    url.searchParams.append("pageCursor", args.pageCursor);
  }

  const response = await makeAuthenticatedRequest(url.toString());

  if (!response.ok) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${response.statusText}`,
        },
      ],
    };
  }

  return {
    content: [
      { type: "text" as const, text: JSON.stringify(await response.json()) },
    ],
  };
}
