"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/contexts/authStore';
import authService from '@/services/authService';
import type { LoginCredentials, SignupCredentials } from '@/types/auth';
import { USER_QUERY_KEY } from './useUser';
import { AuthEvents } from '@/utils/analytics';

// Safe redirect paths that are allowed after authentication
const SAFE_REDIRECT_PREFIXES = ['/shop/', '/dashboard', '/profile'];

/**
 * Check if a redirect path is safe (internal and allowed)
 */
function isSafeRedirect(path: string): boolean {
  if (!path || typeof path !== 'string') return false;
  // Must start with / (relative path)
  if (!path.startsWith('/')) return false;
  // Must not contain protocol (prevent open redirect)
  if (path.includes('://')) return false;
  // Check against allowed prefixes
  return SAFE_REDIRECT_PREFIXES.some(prefix => path.startsWith(prefix));
}

/* ============================================
   Authentication Hooks
   Custom hooks for login, signup, logout, and email verification
   ============================================ */

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  needsVerification: boolean;
  pendingVerificationEmail: string | null;
  resendVerification: () => Promise<void>;
  resendLoading: boolean;
  resendSuccess: boolean;
}

/**
 * Hook for handling user login
 * Manages login state, navigation, and verification errors
 */
export function useLogin(): UseLoginReturn {
  const {
    login: authLogin,
    isLoading,
    error,
    clearError,
    needsVerification,
    pendingVerificationEmail,
  } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Track error state changes for debugging
  useEffect(() => {
    if (error) {
      console.log('useLogin - auth error:', error);
    }
  }, [error]);

  const login = async (credentials: LoginCredentials) => {
    setResendSuccess(false);
    try {
      await authLogin(credentials);
      console.log('Login succeeded, invalidating user query for fresh credits');
      // Invalidate user query to fetch fresh user data (including credits) from API
      await queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });

      // Track successful login
      AuthEvents.login('email');

      // Check for redirect parameter
      const redirectTo = searchParams.get('redirect');
      const destination = redirectTo && isSafeRedirect(redirectTo) ? redirectTo : '/dashboard';
      
      console.log('Login succeeded, navigating to:', destination);
      router.replace(destination);
    } catch {
      console.log('Login failed, error set in store');
      // Error is already set in the store by authLogin
    }
  };

  const resendVerification = async () => {
    if (!pendingVerificationEmail) return;

    setResendLoading(true);
    setResendSuccess(false);
    try {
      await authService.resendVerificationEmail(pendingVerificationEmail);
      setResendSuccess(true);
    } catch (err) {
      console.error('Resend verification failed:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    clearError,
    needsVerification,
    pendingVerificationEmail,
    resendVerification,
    resendLoading,
    resendSuccess,
  };
}

interface UseSignupReturn {
  signup: (credentials: SignupCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for handling user signup
 * Navigates to check-email page on success (NOT dashboard)
 */
export function useSignup(): UseSignupReturn {
  const { signup: authSignup, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  // Track error state changes for debugging
  useEffect(() => {
    if (error) {
      console.log('useSignup - auth error:', error);
    }
  }, [error]);

  const signup = async (credentials: SignupCredentials) => {
    try {
      await authSignup(credentials);
      console.log('Signup succeeded, navigating to check-email');

      // Track successful signup
      AuthEvents.signUp('email');

      // Navigate to check-email page instead of dashboard
      router.replace('/check-email');
    } catch {
      console.log('Signup failed, error set in store');
      // Error is already set in the store by authSignup
    }
  };

  return { signup, isLoading, error, clearError };
}

interface UseVerifyEmailReturn {
  verifyEmail: (token: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

/**
 * Hook for handling email verification
 */
export function useVerifyEmail(): UseVerifyEmailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const verifyEmail = async (token: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setMessage(null);

    try {
      const response = await authService.verifyEmail(token);
      setSuccess(true);
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyEmail, isLoading, error, success, message };
}

interface UseResendVerificationReturn {
  resendVerification: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

/**
 * Hook for resending verification email
 */
export function useResendVerification(): UseResendVerificationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resendVerification = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setMessage(null);

    try {
      const response = await authService.resendVerificationEmail(email);
      setSuccess(true);
      setMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return { resendVerification, isLoading, error, success, message };
}

interface UseLogoutReturn {
  logout: () => void;
  isLoading: boolean;
}

/**
 * Hook for handling user logout
 * Clears auth state and redirects to login page
 */
export function useLogout(): UseLogoutReturn {
  const { logout: authLogout, isLoading } = useAuthStore();
  const router = useRouter();

  const logout = () => {
    authLogout();

    // Track logout event
    AuthEvents.logout();

    router.push('/login');
  };

  return { logout, isLoading };
}

