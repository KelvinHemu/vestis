/**
 * Credits Service
 * 
 * Handles all credit-related API calls, including fetching balance.
 * This is separate from userService to allow independent credit refresh
 * without fetching the entire user profile.
 */

import { API_ENDPOINTS } from '@/config/api';
import { apiFetch } from '@/utils/apiClient';
import { logger } from '@/utils/logger';

/* ============================================
   Types
   ============================================ */

export interface CreditsBalanceResponse {
  credits: number;
  expires_at?: string;
}

/* ============================================
   Credits Service Class
   ============================================ */

class CreditsService {
  /**
   * Get current user's credit balance
   * Lightweight endpoint that only returns credits, not full user profile
   */
  async getBalance(): Promise<CreditsBalanceResponse> {
    try {
      logger.info('📊 Fetching credits balance...');

      const response = await apiFetch(API_ENDPOINTS.credits.balance, {
        method: 'GET',
      });

      // Handle authentication errors
      if (response.status === 401) {
        logger.error('❌ Credits fetch failed - authentication error');
        const error = new Error('Authentication failed');
        (error as any).status = 401;
        throw error;
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to fetch credits balance');
      }

      const data: CreditsBalanceResponse = await response.json();
      logger.info(`✅ Credits balance fetched: ${data.credits}`);

      return data;
    } catch (error: any) {
      // Re-throw auth errors as-is
      if (error?.status === 401 || error?.message?.includes('Session expired')) {
        throw error;
      }

      logger.error('❌ Failed to fetch credits balance:', error);
      throw error;
    }
  }
}

/* ============================================
   Export singleton instance
   ============================================ */

export default new CreditsService();

