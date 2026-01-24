/**
 * Centralized API Configuration
 * 
 * This module provides a single source of truth for all API-related configuration.
 * Use this instead of declaring API_BASE_URL in every service file.
 */

/**
 * Base URL for the backend API
 * Uses Next.js environment variable (NEXT_PUBLIC_ prefix for client-side access)
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * API Configuration Object
 */
export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
} as const;

/**
 * API Endpoints
 * Centralized endpoint definitions for better maintainability
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/v1/auth/login',
    signup: '/v1/auth/signup',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
    googleLogin: '/v1/auth/google/login',
    googleCallback: '/v1/auth/google/callback',
  },

  // User endpoints
  user: {
    profile: '/v1/user',
    update: '/v1/user',
    credits: '/v1/user/credits',
    subscription: '/v1/user/subscription',
  },

  // Credits endpoints
  credits: {
    balance: '/v1/credits/balance',
  },

  // Generation endpoints
  generation: {
    flatlay: '/v1/flatlay/generate',
    onModel: '/v1/onmodel/generate',
    mannequin: '/v1/mannequin/generate',
    backgroundChange: '/v1/background/change',
    chat: '/v1/chat/generate',
    status: (jobId: string) => `/v1/generation/${jobId}/status`,
    history: '/v1/generation/history',
  },

  // Model endpoints
  model: {
    register: '/v1/models/register',
    list: '/v1/models',
    get: (id: string) => `/v1/models/${id}`,
    delete: (id: string) => `/v1/models/${id}`,
  },

  // Payment endpoints
  payment: {
    pricing: '/v1/credits/pricing',
    createPayment: '/v1/payments/zenopay/create',
    checkStatus: (transactionId: string) => `/v1/payments/zenopay/status/${transactionId}`,
    history: '/v1/payments/history',
    // Stripe endpoints
    stripe: {
      checkout: '/v1/payments/stripe/checkout',
      subscribe: '/v1/payments/stripe/subscribe',
      portal: '/v1/payments/stripe/portal',
    },
  },
} as const;

/**
 * Storage keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  user: 'auth_user',
  addModelFormCache: 'add_model_form_data',
} as const;
