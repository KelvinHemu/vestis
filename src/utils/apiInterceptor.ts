import authService from '../services/authService';

/**
 * Enhanced fetch wrapper that automatically handles token refresh
 * and adds authentication headers to requests
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authService.getToken();
  
  // Add auth header if token exists
  const headers = {
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401 (Unauthorized), try to refresh the token
  if (response.status === 401) {
    try {
      // Attempt to refresh the token
      const newToken = await authService.refreshToken();
      
      // Retry the original request with the new token
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        },
      });
    } catch (refreshError) {
      // If refresh fails, logout and redirect to login
      authService.logout();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
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
