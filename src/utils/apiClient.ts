import authService from '../services/authService';
import { useAuthStore } from '../contexts/authStore';
import { API_BASE_URL } from '@/config/api';
import { logger } from '@/utils/logger';
import { isTokenExpired } from '@/utils/tokenHelper';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// ── Concurrency-safe token refresh queue ──
// Only ONE refresh runs at a time; all other callers wait for the same promise.
let refreshPromise: Promise<string> | null = null;

/**
 * Obtain a fresh access token. If a refresh is already in-flight every caller
 * receives the same promise so only a single network request is made.
 */
async function ensureFreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = authService
    .refreshToken()
    .then((newToken) => {
      // Sync Zustand store with the new token
      useAuthStore.getState().updateToken(newToken);
      return newToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/**
 * Full session teardown — only called when the refresh token itself is invalid
 * and there is truly no way to recover.
 */
function forceLogout() {
  authService.logout();
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Enhanced fetch wrapper with automatic token handling.
 *
 * 1. Before every request the access token is checked; if it is about to expire
 *    a silent refresh is attempted **proactively** (no 401 needed).
 * 2. If the server still returns 401 the token is refreshed and the request is
 *    retried **once**.
 * 3. Logout only happens when the refresh token itself is definitively invalid
 *    (401/403 from /auth/refresh).
 */
export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // ── Proactive refresh: swap token before it expires ──
  if (!skipAuth) {
    let token = authService.getToken();
    if (token && isTokenExpired(token)) {
      try {
        logger.info('Access token expired/expiring — refreshing proactively…');
        token = await ensureFreshToken();
      } catch {
        // Proactive refresh failed — still try the request with the old token;
        // the server may have a longer grace window than our 30-second buffer.
      }
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      cache: 'no-store',
    });

    // ── Reactive refresh: server said 401 ──
    if (response.status === 401 && !skipAuth) {
      logger.warn('Received 401 — attempting token refresh…');

      try {
        const newToken = await ensureFreshToken();

        // Retry the original request with the fresh token
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
          cache: 'no-store',
        });

        // If the retry STILL returns 401, the refresh token itself is bad
        if (retryResponse.status === 401) {
          logger.warn('Retry after refresh still 401 — forcing logout');
          forceLogout();
          const err = new Error('Session expired. Please login again.');
          (err as any).status = 401;
          throw err;
        }

        return retryResponse;
      } catch (refreshError: any) {
        // Definitive auth error from the refresh endpoint → logout
        if (refreshError?.isAuthError) {
          logger.warn('Refresh token invalid — forcing logout');
          forceLogout();
          const err = new Error('Session expired. Please login again.');
          (err as any).status = 401;
          throw err;
        }
        // Transient error (network down, 5xx, etc.) — do NOT logout.
        // Surface the error so the UI can show a "network error" message instead
        // of silently booting the user.
        logger.warn('Token refresh failed (transient) — NOT logging out');
        throw refreshError;
      }
    }

    return response;
  } catch (error) {
    if (error instanceof Error && (error as any).status === 401) {
      throw error; // Already handled above
    }
    if (!skipAuth && error instanceof Error && error.message.includes('fetch')) {
      console.error('🔴 Network error:', error);
    }
    throw error;
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (endpoint: string, options?: FetchOptions) =>
    apiFetch(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data?: any, options?: FetchOptions) => {
    // Debug logging for POST requests
    if (data && endpoint.includes('generate')) {
      console.log('📤 API POST to:', endpoint);
      console.log('📦 Data keys:', Object.keys(data));
      if (data.photos) {
        console.log('📸 Photos in request:', data.photos.length, 'photos');
        console.log('📸 First photo structure:', {
          id: data.photos[0]?.id,
          hasImage: !!data.photos[0]?.image,
          imageLength: data.photos[0]?.image?.length || 0,
        });
      }
    }
    
    return apiFetch(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  put: (endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: (endpoint: string, data?: any, options?: FetchOptions) =>
    apiFetch(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (endpoint: string, options?: FetchOptions) =>
    apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
