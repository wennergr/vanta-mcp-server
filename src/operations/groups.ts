import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { baseApiUrl } from "../api.js";
import { Tool } from "../types.js";
import { z } from "zod";
import { makeAuthenticatedRequest, filterPersonData } from "./utils.js";

const GetGroupsInput = z.object({
  pageSize: z
    .number()
    .describe("Number of groups to return (1-100, default 10)")
    .optional(),
  pageCursor: z.string().describe("Pagination cursor for next page").optional(),
});

const GetGroupMembersInput = z.object({
  groupId: z.string().describe("The ID of the group to get members for"),
  pageSize: z
    .number()
    .describe("Number of people to return (1-100, default 10)")
    .optional(),
  pageCursor: z.string().describe("Pagination cursor for next page").optional(),
});

export const GetGroupsTool: Tool<typeof GetGroupsInput> = {
  name: "get_groups",
  description:
    "Returns a list of all groups in your Vanta account. Groups are collections of people used for organizing team members, departments, or other organizational units for compliance and security management purposes.",
  parameters: GetGroupsInput,
};

export const GetGroupMembersTool: Tool<typeof GetGroupMembersInput> = {
  name: "get_group_members",
  description:
    "Returns a list of all people who are members of a specific group in Vanta. This is useful for understanding group composition and managing access controls based on group membership. Note: The response is filtered to exclude detailed source information and task details to reduce payload size.",
  parameters: GetGroupMembersInput,
};

export async function getGroups(
  args: z.infer<typeof GetGroupsInput>,
): Promise<CallToolResult> {
  const url = new URL("/v1/groups", baseApiUrl());

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

  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}

export async function getGroupMembers(
  args: z.infer<typeof GetGroupMembersInput>,
): Promise<CallToolResult> {
  const url = new URL(`/v1/groups/${args.groupId}/people`, baseApiUrl());

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (Array.isArray(data?.results?.data)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    data.results.data = data.results.data.map((person: any) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      filterPersonData(person),
    );
  }

  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
}
