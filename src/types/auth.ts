// Import User type from user.ts to avoid duplication
// This ensures onboarding fields are available
import type { User } from './user';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface OAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface VerifyTokenResponse {
  valid: boolean;
  user_id: number;
  email: string;
  message: string;
}

export interface RefreshTokenResponse {
  token: string;
  message?: string;
}

// Email verification flow types
export interface SignupResponse {
  message: string;
  email: string;
}

export interface VerifyEmailResponse {
  message: string;
  success: boolean;
}

export interface ResendVerificationResponse {
  message: string;
  success: boolean;
}

export interface LoginErrorResponse {
  error: string;
  needs_verification?: boolean;
  email?: string;
}
