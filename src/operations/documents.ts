import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { baseApiUrl } from "../api.js";
import { Tool } from "../types.js";
import { z } from "zod";
import { createAuthHeaders } from "./utils.js";

const UploadDocumentInput = z.object({
  documentId: z.string(),
  file: z.instanceof(File), // This assumes a browser/File API context; will test this manually
});

export const UploadDocumentTool: Tool<typeof UploadDocumentInput> = {
  name: "upload_document",
  description: "Upload compliance documentation and evidence files to Vanta. Used for policy documents, procedures, audit evidence, and proof of security control implementation. Supports the documentation requirements needed for compliance audits and framework certification.",
  parameters: UploadDocumentInput,
};

export async function uploadDocument(
  args: z.infer<typeof UploadDocumentInput>,
): Promise<CallToolResult> {
  const url = new URL(`/v1/documents/${args.documentId}/upload`, baseApiUrl());
  const headers = createAuthHeaders();

  const formData = new FormData();
  formData.append("file", args.file);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers, // Do not set Content-Type; let fetch handle it for multipart
    body: formData,
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
