import { getValidToken, refreshToken } from "../auth.js";

export async function createAuthHeaders(): Promise<Record<string, string>> {
  const token = await getValidToken();
  return {
    "Authorization": `Bearer ${token}`,
    "x-vanta-is-mcp": "true",
  };
}

/**
 * Makes an authenticated HTTP request using a bearer token from the Vanta MCP auth system.
 * If the request returns a 401 Unauthorized, it will refresh the token and retry once.
 *
 * @param {string} url - The URL to send the request to.
 * @param {RequestInit} [options={}] - Optional fetch options (method, headers, body, etc.).
 * @returns {Promise<Response>} The fetch Response object.
 */
export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let headers = await createAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // If we get unauthorized, try refreshing the token once
  if (response.status === 401) {
    const newToken = await refreshToken();
    headers = {
      "Authorization": `Bearer ${newToken}`,
      "x-vanta-is-mcp": "true",
    };

    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
  }

  return response;
}
