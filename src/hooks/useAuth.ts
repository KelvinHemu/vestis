import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';
import type { LoginCredentials, SignupCredentials } from '../types/auth';

interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useLogin(onSuccess?: () => void): UseLoginReturn {
  const { login: authLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Track error state changes
  useEffect(() => {
    console.log('useLogin - authStore error state changed to:', error);
  }, [error]);

  const login = async (credentials: LoginCredentials) => {
    console.log('login() called');
    try {
      await authLogin(credentials);
      console.log('authLogin succeeded, navigating to dashboard');
      onSuccess?.();
      navigate('/dashboard');
    } catch (err) {
      console.log('ERROR CAUGHT in useLogin, error should be in store now');
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

export function useSignup(onSuccess?: () => void): UseSignupReturn {
  const { signup: authSignup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  // Track error state changes
  useEffect(() => {
    console.log('useSignup - authStore error state changed to:', error);
  }, [error]);

  const signup = async (credentials: SignupCredentials) => {
    console.log('signup() called');
    try {
      await authSignup(credentials);
      console.log('authSignup succeeded, navigating to dashboard');
      onSuccess?.();
      navigate('/dashboard');
    } catch (err) {
      console.log('ERROR CAUGHT in useSignup, error should be in store now');
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

export function useLogout(): UseLogoutReturn {
  const { logout: authLogout, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const logout = () => {
    authLogout();
    navigate('/login');
  };

  return { logout, isLoading };
}
