"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/authStore';
import type { LoginCredentials, SignupCredentials } from '@/types/auth';

/* ============================================
   Authentication Hooks
   Custom hooks for login, signup, and logout
   ============================================ */

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for handling user login
 * Manages login state and navigation after successful auth
 */
export function useLogin(): UseLoginReturn {
  const { login: authLogin, isLoading, error, clearError } = useAuthStore();
  const router = useRouter();

  // Track error state changes for debugging
  useEffect(() => {
    if (error) {
      console.log('useLogin - auth error:', error);
    }
  }, [error]);

  const login = async (credentials: LoginCredentials) => {
    try {
      await authLogin(credentials);
      console.log('Login succeeded, navigating to dashboard');
      // Use replace to prevent back button going to login
      router.replace('/dashboard');
    } catch {
      console.log('Login failed, error set in store');
      // Error is already set in the store by authLogin
      // Don't navigate - stay on login page to show error
    }
  };

  return { login, isLoading, error, clearError };
}

interface UseSignupReturn {
  signup: (credentials: SignupCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for handling user signup
 * Manages signup state and navigation after successful registration
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
      console.log('Signup succeeded, navigating to dashboard');
      // Use replace to prevent back button going to signup
      router.replace('/dashboard');
    } catch {
      console.log('Signup failed, error set in store');
      // Error is already set in the store by authSignup
      // Don't navigate - stay on signup page to show error
    }
  };

  return { signup, isLoading, error, clearError };
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
    router.push('/login');
  };

  return { logout, isLoading };
}
