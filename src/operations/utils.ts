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

/**
 * Filters person data to remove large/unnecessary fields for better performance.
 * Removes the 'sources' field and 'tasksSummary.details' field while keeping other data.
 *
 * @param {any} person - The person object to filter
 * @returns {any} The filtered person object
 */
export function filterPersonData(person: any): any {
  // Remove sources field
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
  const { sources: _sources, ...personWithoutSources } = person;

  // Remove tasksSummary.details field while keeping the rest of tasksSummary
  if (
    personWithoutSources.tasksSummary &&
    personWithoutSources.tasksSummary.details
  ) {
    const { details: _details, ...tasksSummaryWithoutDetails } =
      personWithoutSources.tasksSummary;
    personWithoutSources.tasksSummary = tasksSummaryWithoutDetails;
  }

  return personWithoutSources;
}
