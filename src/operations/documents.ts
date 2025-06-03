import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { baseApiUrl } from "../api.js";
import { Tool } from "../types.js";
import { z } from "zod";
import { getValidToken, refreshToken } from "../auth.js";

const UploadDocumentInput = z.object({
  documentId: z
    .string()
    .describe(
      "Document ID in Vanta system where the file should be uploaded, e.g. 'doc-123' or 'incident-response-policy'",
    ),
  file: z
    .instanceof(File)
    .describe(
      "File object to upload - policy document, procedure, or compliance evidence file",
    ), // This assumes a browser/File API context; will test this manually
});

export const UploadDocumentTool: Tool<typeof UploadDocumentInput> = {
  name: "upload_document",
  description:
    "UPLOAD files and documents to Vanta for compliance evidence. Use this when you need to upload, attach, or submit documents like policies, procedures, incident reports, or other compliance evidence files. Requires a documentId and the actual file to upload. This is for UPLOADING files, not for viewing or retrieving existing documents.",
  parameters: UploadDocumentInput,
};

export async function uploadDocument(
  args: z.infer<typeof UploadDocumentInput>,
): Promise<CallToolResult> {
  const url = new URL(`/v1/documents/${args.documentId}/upload`, baseApiUrl());

  let token = await getValidToken();
  const headers = {
    "Authorization": `Bearer ${token}`,
    "x-vanta-is-mcp": "true",
  };

  const formData = new FormData();
  formData.append("file", args.file);

  let response = await fetch(url.toString(), {
    method: "POST",
    headers, // Do not set Content-Type; let fetch handle it for multipart
    body: formData,
  });

  // If we get unauthorized, try refreshing the token once
  if (response.status === 401) {
    token = await refreshToken();
    const newHeaders = {
      "Authorization": `Bearer ${token}`,
      "x-vanta-is-mcp": "true",
    };

    response = await fetch(url.toString(), {
      method: "POST",
      headers: newHeaders,
      body: formData,
    });
  }

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
