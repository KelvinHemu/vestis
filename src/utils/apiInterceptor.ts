import authService from '../services/authService';
import { useAuthStore } from '../contexts/authStore';
import { isTokenExpired } from '@/utils/tokenHelper';

// ── Shared concurrency-safe refresh queue ──
let refreshPromise: Promise<string> | null = null;

async function ensureFreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = authService
    .refreshToken()
    .then((newToken) => {
      useAuthStore.getState().updateToken(newToken);
      return newToken;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function forceLogout() {
  authService.logout();
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Enhanced fetch wrapper that automatically handles token refresh
 * and adds authentication headers to requests.
 *
 * - Proactively refreshes tokens that are about to expire.
 * - Reactively refreshes on 401 and retries the request once.
 * - Only logs out when the refresh token itself is definitively invalid.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // ── Proactive refresh ──
  let token = authService.getToken();
  if (token && isTokenExpired(token)) {
    try {
      token = await ensureFreshToken();
    } catch {
      // Will try with old token; server may still accept it
    }
  }

  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  let response = await fetch(url, { ...options, headers });

  // ── Reactive refresh on 401 ──
  if (response.status === 401) {
    try {
      const newToken = await ensureFreshToken();

      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        },
      });

      // Retry still 401 → refresh token is bad
      if (response.status === 401) {
        forceLogout();
        throw new Error('Session expired. Please login again.');
      }
    } catch (err: any) {
      if (err?.isAuthError) {
        forceLogout();
        throw new Error('Session expired. Please login again.');
      }
      // Transient error — do NOT logout
      throw err;
    }
  }

  return response;
}

/**
 * Helper to make GET requests with authentication
 */
export async function getWithAuth<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Helper to make POST requests with authentication
 */
export async function postWithAuth<T>(
  url: string,
  data: any
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Helper to upload files with authentication
 */
export async function uploadWithAuth<T>(
  url: string,
  formData: FormData
): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
