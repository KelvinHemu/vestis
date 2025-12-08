import type { UserResponse } from '../types/user';

// API base URL using Next.js environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
