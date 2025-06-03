import fs from "node:fs";
import { baseApiUrl } from "./api.js";

const VANTA_API_SCOPE = "vanta-api.all:read";

interface OAuthCredentials {
  client_id: string;
  client_secret: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TokenInfo {
  token: string;
  expiresAt: number;
}

let currentToken: TokenInfo | null = null;

function loadCredentials(): OAuthCredentials {
  const envFile = process.env.VANTA_ENV_FILE;
  if (!envFile) {
    throw new Error("VANTA_ENV_FILE environment variable is required");
  }

  try {
    const data = fs.readFileSync(envFile, "utf8");
    const credentials = JSON.parse(data) as unknown;

    if (typeof credentials !== "object" || credentials === null) {
      throw new Error("Credentials file must contain a JSON object");
    }

    const creds = credentials as Record<string, unknown>;

    if (
      typeof creds.client_id !== "string" ||
      typeof creds.client_secret !== "string"
    ) {
      throw new Error(
        "client_id and client_secret are required as strings in the credentials file",
      );
    }

    return {
      client_id: creds.client_id,
      client_secret: creds.client_secret,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in credentials file: ${envFile}`);
    }
    throw new Error(
      `Failed to load credentials from ${envFile}: ${String(error)}`,
    );
  }
}

async function fetchNewToken(): Promise<TokenInfo> {
  const credentials = loadCredentials();

  const response = await fetch(`${baseApiUrl()}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      grant_type: "client_credentials",
      scope: VANTA_API_SCOPE,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OAuth token request failed: ${response.status.toString()} ${response.statusText} - ${errorText}`,
    );
  }

  const tokenResponse = (await response.json()) as TokenResponse;

  const expiresAt = Date.now() + tokenResponse.expires_in * 1000 - 60000; // Subtract 1 minute buffer

  return {
    token: tokenResponse.access_token,
    expiresAt,
  };
}

function isTokenExpired(tokenInfo: TokenInfo): boolean {
  return Date.now() >= tokenInfo.expiresAt;
}

export async function getValidToken(): Promise<string> {
  if (!currentToken || isTokenExpired(currentToken)) {
    currentToken = await fetchNewToken();
  }

  return currentToken.token;
}

export async function refreshToken(): Promise<string> {
  currentToken = await fetchNewToken();
  return currentToken.token;
}

export async function initializeToken(): Promise<void> {
  await getValidToken();
}
