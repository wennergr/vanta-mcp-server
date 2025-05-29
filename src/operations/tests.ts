import { baseApiUrl } from "../api.js";
import { z } from "zod";
import { Tool } from "../types.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createAuthHeaders } from "./utils.js";

export async function getTests(
  args: z.infer<typeof GetTestsInput>,
): Promise<CallToolResult> {
  const url = new URL("/v1/tests", baseApiUrl());

  if (args.pageSize !== undefined) {
    url.searchParams.append("pageSize", args.pageSize.toString());
  }
  if (args.statusFilter !== undefined) {
    url.searchParams.append("statusFilter", args.statusFilter);
  }
  if (args.integrationFilter !== undefined) {
    url.searchParams.append("integrationFilter", args.integrationFilter);
  }
  if (args.frameworkFilter !== undefined) {
    url.searchParams.append("frameworkFilter", args.frameworkFilter);
  }

  const headers = createAuthHeaders();

  const response = await fetch(url.toString(), {
    headers,
  });

  if (!response.ok) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Url: ${url.toString()}, Error: ${response.statusText}`,
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

export async function getTestEntities(
  args: z.infer<typeof GetTestEntitiesInput>,
): Promise<CallToolResult> {
  const url = new URL(`/v1/tests/${args.testId}/entities`, baseApiUrl());
  if (args.pageSize !== undefined) {
    url.searchParams.append("pageSize", args.pageSize.toString());
  }
  if (args.pageCursor !== undefined) {
    url.searchParams.append("pageCursor", args.pageCursor);
  }
  if (args.entityStatus !== undefined) {
    url.searchParams.append("entityStatus", args.entityStatus);
  }

  const headers = createAuthHeaders();

  const response = await fetch(url.toString(), {
    headers,
  });

  if (!response.ok) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Url: ${url.toString()}, Error: ${response.statusText}`,
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

export async function deactivateTestEntity(
  args: z.infer<typeof DeactivateTestEntityInput>,
): Promise<CallToolResult> {
  const url = new URL(
    `/v1/tests/${args.testId}/entities/${args.entityId}/deactivate`,
    baseApiUrl(),
  );
  const headers = createAuthHeaders();

  const response = await fetch(url.toString(), {
    method: "POST",
    headers,
    body: JSON.stringify({
      deactivateUntil: args.deactivateUntil,
      reason: args.deactivateReason,
    }),
  });

  if (!response.ok) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Url: ${url.toString()}, Error: ${response.statusText}`,
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

const TOOL_DESCRIPTION = `Retrieve Vanta's automated security and compliance tests. Vanta runs 1,200+ automated tests continuously to monitor compliance across your infrastructure. Filter by status (OK, NEEDS_ATTENTION, DEACTIVATED), cloud integration (aws, azure, gcp), or compliance framework (soc2, iso27001, hipaa). Returns test results showing which security controls are passing or failing across your infrastructure. Tests that are NOT_APPLICABLE to your resources are included by default - use statusFilter=NEEDS_ATTENTION to retrieve only actionable failing tests.`;

const TEST_STATUS_FILTER_DESCRIPTION = `Filter tests by their status.
Helpful for retrieving only relevant or actionable results.
Possible values: OK, DEACTIVATED, NEEDS_ATTENTION, IN_PROGRESS, INVALID, NOT_APPLICABLE.`;

const PAGE_SIZE_DESCRIPTION = `Controls the maximum number of tests returned in a single response.
Allowed values: 1–100. Default is 10.`;

const INTEGRATION_FILTER_DESCRIPTION = `Filter by integration. Non-exhaustive examples of possible values include aws, azure, gcp, snyk.`;

const FRAMEWORK_FILTER_DESCRIPTION = `Filter by framework. Non-exhaustive examples: soc2, ccpa, fedramp`;

const CONTROL_FILTER_DESCRIPTION = `Filter by control. Generally will only be known if pulled from the /v1/controls endpoint.`;

export const GetTestsInput = z.object({
  pageSize: z.number().describe(PAGE_SIZE_DESCRIPTION).optional(),
  statusFilter: z.string().describe(TEST_STATUS_FILTER_DESCRIPTION).optional(),
  integrationFilter: z
    .string()
    .describe(INTEGRATION_FILTER_DESCRIPTION)
    .optional(),
  frameworkFilter: z.string().describe(FRAMEWORK_FILTER_DESCRIPTION).optional(),
  controlFilter: z.string().describe(CONTROL_FILTER_DESCRIPTION).optional(),
});

export const GetTestsTool: Tool<typeof GetTestsInput> = {
  name: "get_tests",
  description: TOOL_DESCRIPTION,
  parameters: GetTestsInput,
};

const GetTestEntitiesInput = z.object({
  testId: z.string().describe("Lowercase with hyphens"),
  pageSize: z
    .number()
    .describe(
      "Controls the maximum number of tests returned in a single response. Allowed values: 1–100. Default is 10.",
    )
    .optional(),
  pageCursor: z
    .string()
    .describe("Used for pagination. Leave blank to start from the first page.")
    .optional(),
  entityStatus: z
    .string()
    .describe("Filter by entity status. Possible values: FAILING, DEACTIVATED.")
    .optional(),
});

export const GetTestEntitiesTool: Tool<typeof GetTestEntitiesInput> = {
  name: "get_test_entities",
  description: `Get the specific failing resources (entities) for a known test ID. Use this when you already know the test name/ID and need to see which specific infrastructure resources are failing that test. For example, if you know "aws-security-groups-open-to-world" test is failing, this returns the actual security group IDs that are failing. Requires a specific testId parameter. Do NOT use this for general test discovery - use get_tests for that.`,
  parameters: GetTestEntitiesInput,
};

export const DeactivateTestEntityInput = z.object({
  testId: z
    .string()
    .describe(
      "Test ID in lowercase with hyphens, e.g. 'aws-security-groups-open-to-world'",
    ),
  entityId: z
    .string()
    .describe(
      "Entity ID of the specific resource to deactivate, e.g. 'sg-12345'",
    ),
  deactivateReason: z
    .string()
    .describe(
      "Business reason for deactivation, e.g. 'Scheduled maintenance' or 'Emergency patching'",
    ),
  deactivateUntil: z
    .string()
    .describe(
      "End date/time in ISO format YYYY-MM-DDTHH:MM:SSZ, e.g. '2024-02-15T10:00:00Z'",
    ),
});

export const DeactivateTestEntityTool: Tool<typeof DeactivateTestEntityInput> =
  {
    name: "deactivate_test_entity",
    description: `DEACTIVATE/SUPPRESS alerts for a specific failing resource. Use this ONLY when you need to temporarily silence/disable/mute alerts for a specific entity during maintenance, patching, or remediation work. Requires both testId and entityId parameters, plus a reason and end date. This is for SUPPRESSING existing alerts, not for viewing them.`,
    parameters: DeactivateTestEntityInput,
  };
