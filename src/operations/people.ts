import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { baseApiUrl } from "../api.js";
import { Tool } from "../types.js";
import { z } from "zod";
import { makeAuthenticatedRequest } from "./utils.js";

const GetPeopleInput = z.object({
  pageSize: z
    .number()
    .describe("Number of people to return (1-100, default 10)")
    .optional(),
  pageCursor: z.string().describe("Pagination cursor for next page").optional(),
});

export const GetPeopleTool: Tool<typeof GetPeopleInput> = {
  name: "get_people",
  description:
    "Returns a list of all people in your Vanta account. This includes employees, contractors, and other personnel who have access to your organization's systems and data. Use this to get information about team members for compliance and security management purposes. Note: The response is filtered to exclude detailed source information and task details to reduce payload size.",
  parameters: GetPeopleInput,
};

export async function getPeople(
  args: z.infer<typeof GetPeopleInput>,
): Promise<CallToolResult> {
  const url = new URL("/v1/people", baseApiUrl());

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();

  // Filter out large/unnecessary fields from the response
  if (Array.isArray(data?.results?.data)) {
    data.results.data = data.results.data.map((person: any) => {
      // Remove sources field
      const { sources: _, ...personWithoutSources } = person;

      // Remove tasksSummary.details field while keeping the rest of tasksSummary
      if (
        personWithoutSources.tasksSummary &&
        personWithoutSources.tasksSummary.details
      ) {
        const { details: _, ...tasksSummaryWithoutDetails } =
          personWithoutSources.tasksSummary;
        personWithoutSources.tasksSummary = tasksSummaryWithoutDetails;
      }

      return personWithoutSources;
    });
  }

  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}
