import type { UserResponse } from '../types/user';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { logger } from '@/utils/logger';

class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(token: string): Promise<UserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to fetch user data');
      }

      const data: UserResponse = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
