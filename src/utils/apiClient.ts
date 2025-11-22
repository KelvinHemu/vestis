import authService from '../services/authService';
import { useAuthStore } from '../contexts/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// Track token refresh to prevent concurrent refresh attempts
let tokenRefreshPromise: Promise<string> | null = null;
let isRefreshing = false;

/**
 * Enhanced fetch wrapper with automatic token handling
 * Automatically adds Authorization header and handles token expiration
 */
export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // Add base URL if not already present
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Add default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add Authorization header if not skipped and token exists
  if (!skipAuth) {
    const token = authService.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401 && !skipAuth) {
      console.warn('⚠️ Received 401 Unauthorized. Attempting token refresh...');
      
      // Prevent concurrent token refresh requests
      if (isRefreshing) {
        // Wait for ongoing refresh to complete
        if (tokenRefreshPromise) {
          await tokenRefreshPromise;
        }
        
        // Retry with the refreshed token
        const newToken = authService.getToken();
        if (newToken) {
          const retryHeaders: Record<string, string> = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          
          return await fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
          });
        }
      }
      
      // Start token refresh
      isRefreshing = true;
      try {
        tokenRefreshPromise = authService.refreshToken();
        const newToken = await tokenRefreshPromise;
        
        if (newToken) {
          // Update the auth store with the new token
          const updateToken = useAuthStore.getState().updateToken;
          updateToken(newToken);
          
          // Retry the original request with new token
          const retryHeaders: Record<string, string> = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
          });
          
          // If retry still fails with 401, session is invalid
          if (retryResponse.status === 401) {
            authService.logout();
            const logout = useAuthStore.getState().logout;
            logout();
            window.location.href = '/login';
            throw new Error('Session expired');
          }
          
          return retryResponse;
        }
      } catch (refreshError) {
        // Token refresh failed - logout and redirect
        authService.logout();
        const logout = useAuthStore.getState().logout;
        logout();
        window.location.href = '/login';
        throw refreshError;
      } finally {
        isRefreshing = false;
        tokenRefreshPromise = null;
      }
    }

    return response;
  } catch (error) {
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
