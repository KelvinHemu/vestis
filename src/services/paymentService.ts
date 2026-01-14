import api from '../utils/apiClient';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { logger } from '@/utils/logger';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
  price_tzs: number;
  per_credit_usd: number;
  savings: number;
  recommended: boolean;
}

export interface GenerationCosts {
  background: number;
  onmodel: number;
  flatlay: number;
  mannequin: number;
  chat: number;
  legacy: number;
}

export interface PricingResponse {
  packages: CreditPackage[];
  generation_costs: GenerationCosts;
  currency: string;
}

export interface CreatePaymentRequest {
  package_id: string;
  buyer_phone: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  order_id: string;
  reference: string;
  amount_tzs: number;
  credits: number;
  status: string;
  message: string;
}

export interface PaymentStatus {
  order_id: string;
  payment_status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  amount_tzs: number;
  credits: number;
  channel: string;
  reference: string;
  transaction_id?: string;
  created_at: string;
  source: string;
}

export interface Payment {
  id: number;
  user_id: number;
  order_id: string;
  amount: number;
  credits: number;
  payment_method: string;
  status: string;
  reference: string;
  buyer_phone: string;
  metadata: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface PaymentHistoryResponse {
  payments: Payment[];
  metadata: {
    current_page: number;
    page_size: number;
    total_records: number;
  };
}

// ============ Stripe Payment Types ============

export interface StripeCheckoutRequest {
  package_id: string;
}

export interface StripeCheckoutResponse {
  success: boolean;
  checkout_url: string;
  session_id: string;
  order_id: string;
  amount_usd: number;
  credits: number;
  billing?: 'one-time' | 'monthly';
  status: string;
  message: string;
}

export interface StripePortalResponse {
  success: boolean;
  portal_url: string;
  message: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | null;
  subscription_id?: string;
  period_end?: string;
  has_payment_history: boolean;
}

class PaymentService {
  /**
   * Get available credit packages and pricing (public endpoint)
   */
  async getPricing(): Promise<PricingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/credits/pricing`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to fetch pricing');
      }

      return await response.json();
    } catch (error) {
      logger.apiError('/v1/credits/pricing', error);
      throw error;
    }
  }

  /**
   * Create a new payment and initiate mobile money transaction
   */
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const response = await api.post('/v1/payments/zenopay/create', data);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create payment');
      }

      return await response.json();
    } catch (error) {
      logger.apiError('/v1/payments/zenopay/create', error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    try {
      const endpoint = `/v1/payments/zenopay/status?order_id=${orderId}`;
      logger.apiRequest(endpoint, 'GET');

      const response = await api.get(endpoint);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        logger.apiError(endpoint, error);
        throw new Error(error.error || 'Failed to check payment status');
      }

      const data = await response.json();
      logger.apiResponse(endpoint, response.status, data);
      return data;
    } catch (error) {
      logger.apiError('/v1/payments/zenopay/status', error);
      throw error;
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(page: number = 1, pageSize: number = 20): Promise<PaymentHistoryResponse> {
    try {
      const response = await api.get(`/v1/payments/history?page=${page}&page_size=${pageSize}`);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to fetch payment history');
      }

      return await response.json();
    } catch (error) {
      logger.apiError('/v1/payments/history', error);
      throw error;
    }
  }

  /**
   * Validate Tanzanian phone number
   */
  validatePhoneNumber(phone: string): boolean {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // Check format: 0XXXXXXXXX (10 digits) or 255XXXXXXXXX (12 digits)
    const pattern = /^(0\d{9}|255\d{9})$/;
    return pattern.test(cleaned);
  }

  /**
   * Format TZS currency
   */
  formatTZS(amount: number): string {
    return `TZS ${amount.toLocaleString('en-TZ')}`;
  }

  /**
   * Poll payment status with timeout
   */
  async pollPaymentStatus(
    orderId: string,
    onUpdate: (status: PaymentStatus) => void,
    maxAttempts: number = 40,
    intervalMs: number = 3000
  ): Promise<PaymentStatus> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const status = await this.getPaymentStatus(orderId);
        onUpdate(status);

        const statusUpper = status.payment_status.toUpperCase();
        if (statusUpper === 'COMPLETED' ||
          statusUpper === 'FAILED' ||
          statusUpper === 'CANCELLED') {
          return status;
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        logger.warn('Error polling payment status', { data: error });
        // Continue polling even on error
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Payment status check timeout');
  }

  // ============ Stripe Payment Methods ============

  /**
   * Create a Stripe checkout session for one-time payment
   */
  async createStripeCheckout(packageId: string): Promise<StripeCheckoutResponse> {
    try {
      const endpoint = API_ENDPOINTS.payment.stripe.checkout;
      logger.apiRequest(endpoint, 'POST', { package_id: packageId });

      const response = await api.post(endpoint, { package_id: packageId });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        logger.apiError(endpoint, error);
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      logger.apiResponse(endpoint, response.status, data);
      return data;
    } catch (error) {
      logger.apiError(API_ENDPOINTS.payment.stripe.checkout, error);
      throw error;
    }
  }

  /**
   * Create a Stripe subscription checkout session
   */
  async createStripeSubscription(packageId: string): Promise<StripeCheckoutResponse> {
    try {
      const endpoint = API_ENDPOINTS.payment.stripe.subscribe;
      logger.apiRequest(endpoint, 'POST', { package_id: packageId });

      const response = await api.post(endpoint, { package_id: packageId });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        logger.apiError(endpoint, error);
        throw new Error(error.error || 'Failed to create subscription');
      }

      const data = await response.json();
      logger.apiResponse(endpoint, response.status, data);
      return data;
    } catch (error) {
      logger.apiError(API_ENDPOINTS.payment.stripe.subscribe, error);
      throw error;
    }
  }

  /**
   * Get user's subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const endpoint = API_ENDPOINTS.user.subscription;
      logger.apiRequest(endpoint, 'GET');

      const response = await api.get(endpoint);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        logger.apiError(endpoint, error);
        throw new Error(error.error || 'Failed to get subscription status');
      }

      const data = await response.json();
      logger.apiResponse(endpoint, response.status, data);
      return data;
    } catch (error) {
      logger.apiError(API_ENDPOINTS.user.subscription, error);
      throw error;
    }
  }

  /**
   * Open Stripe customer billing portal
   */
  async openBillingPortal(): Promise<StripePortalResponse> {
    try {
      const endpoint = API_ENDPOINTS.payment.stripe.portal;
      logger.apiRequest(endpoint, 'POST');

      const response = await api.post(endpoint, {});

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        logger.apiError(endpoint, error);
        throw new Error(error.error || 'Failed to open billing portal');
      }

      const data = await response.json();
      logger.apiResponse(endpoint, response.status, data);
      return data;
    } catch (error) {
      logger.apiError(API_ENDPOINTS.payment.stripe.portal, error);
      throw error;
    }
  }

  /**
   * Format USD currency
   */
  formatUSD(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }
}

export default new PaymentService();
