import { env } from "process";

export function createAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (env.VANTA_API_KEY != null) {
    headers.Authorization = `Bearer ${env.VANTA_API_KEY}`;
  }
  headers["x-vanta-is-mcp"] = "true";
  return headers;
}
