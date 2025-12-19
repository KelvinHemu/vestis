import type { UserResponse } from '../types/user';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { logger } from '@/utils/logger';
import { apiFetch } from '@/utils/apiClient';

class UserService {
  /**
   * Get current user profile
   * Uses apiFetch which automatically handles token refresh and authentication
   */
  async getCurrentUser(token: string): Promise<UserResponse> {
    try {
      // Use apiFetch which has automatic token refresh and auth error handling
      const response = await apiFetch('/v1/user', {
        method: 'GET',
      });

      // If we get here after a 401, token refresh failed and redirect will happen
      if (!response.ok) {
        // For 401 errors, create a specific auth error
        if (response.status === 401) {
          logger.error('❌ User authentication failed - tokens expired');
          const error = new Error('Authentication failed');
          (error as any).status = 401;
          throw error;
        }
        
        // For other errors, parse the response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to fetch user data');
      }

      const data: UserResponse = await response.json();
      return data;
    } catch (error: any) {
      // If it's an auth error, preserve the status
      if (error?.status === 401 || error?.message?.includes('Session expired')) {
        const authError = new Error('Authentication failed');
        (authError as any).status = 401;
        throw authError;
      }
      throw error;
    }
  }
}

export default new UserService();
