/**
 * Token helper utilities for JWT token management
 */

/**
 * Decode JWT token to get payload
 */
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Add 30 second buffer to consider token expired slightly early
    const isExpired = currentTime >= expirationTime - 30000;
    
    if (isExpired) {
      console.warn('⚠️ Token is expired:', {
        expirationTime: new Date(expirationTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
      });
    }
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return null;
    
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
}

/**
 * Get time until token expires (in seconds)
 */
export function getTimeUntilExpiration(token: string): number | null {
  try {
    const expirationDate = getTokenExpiration(token);
    if (!expirationDate) return null;
    
    const timeUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / 1000);
    return timeUntilExpiration;
  } catch (error) {
    console.error('Error calculating time until expiration:', error);
    return null;
  }
}
