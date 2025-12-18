/**
 * OAuth Helper Utilities
 * Functions to process and decode OAuth tokens from URL hash
 */

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: string;
}

export interface DecodedUser {
  id: number;
  email: string;
  name?: string;
}

/**
 * Extract OAuth tokens from URL hash
 * Format: #access_token=...&refresh_token=...&token_type=...&expires_in=...
 */
export function extractOAuthTokensFromHash(hash: string): OAuthTokens | null {
  if (!hash) return null;

  // Remove leading # if present
  const cleanHash = hash.startsWith("#") ? hash.substring(1) : hash;
  const params = new URLSearchParams(cleanHash);

  const accessToken = params.get("access_token");
  
  if (!accessToken) return null;

  return {
    accessToken,
    refreshToken: params.get("refresh_token") || undefined,
    tokenType: params.get("token_type") || undefined,
    expiresIn: params.get("expires_in") || undefined,
  };
}

/**
 * Decode JWT token to extract user information
 * Note: This does NOT verify the token - verification happens on the backend
 */
export function decodeJWTToken(token: string): DecodedUser | null {
  try {
    // Split JWT token into parts
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // Decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    
    // Decode base64 and parse JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    // Extract user info from payload
    return {
      id: payload.user_id,
      email: payload.email,
      name: payload.name || payload.email?.split("@")[0],
    };
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
}

/**
 * Store OAuth tokens and user info in localStorage
 */
export function storeOAuthData(tokens: OAuthTokens, user: DecodedUser): void {
  // Store access token
  localStorage.setItem("auth_token", tokens.accessToken);

  // Store refresh token if available
  if (tokens.refreshToken) {
    localStorage.setItem("refresh_token", tokens.refreshToken);
  }

  // Store user info
  localStorage.setItem("auth_user", JSON.stringify(user));
}

/**
 * Process OAuth callback from URL hash
 * Returns user and access token if successful, null if no tokens found
 */
export function processOAuthCallback(): { user: DecodedUser; accessToken: string } | null {
  // Get URL hash
  const hash = window.location.hash;
  if (!hash) return null;

  // Extract tokens from hash
  const tokens = extractOAuthTokensFromHash(hash);
  if (!tokens) return null;

  // Decode user info from access token
  const user = decodeJWTToken(tokens.accessToken);
  if (!user) return null;

  // Store tokens and user in localStorage
  storeOAuthData(tokens, user);

  // Clean URL by removing hash
  window.history.replaceState(null, "", window.location.pathname);

  return { user, accessToken: tokens.accessToken };
}





