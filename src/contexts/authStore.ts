import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, SignupCredentials } from '../types/auth';
import authService from '../services/authService';
import { isTokenExpired } from '../utils/tokenHelper';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  loginWithOAuth: (accessToken: string, user: any) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateToken: (token: string) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  isInitialized: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isInitialized: false,
      _hasHydrated: false,
      
      /**
       * Set hydration state - called by persist middleware
       */
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      /**
       * Initialize auth state from storage
       * Only runs AFTER hydration is complete
       */
      initializeAuth: async () => {
        const state = get();
        
        // If already initialized, skip
        if (state.isInitialized) {
          return;
        }

        set({ isLoading: true });
        try {
          const token = authService.getToken();
          const user = authService.getUser();
          const refreshToken = authService.getRefreshToken();

          if (token && user) {
            // Check if token is expired
            const expired = isTokenExpired(token);
            
            if (expired && refreshToken) {
              // Token expired, try to refresh
              try {
                const newToken = await authService.refreshToken();
                
                set({
                  user,
                  token: newToken,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                  isInitialized: true,
                });
                return;
              } catch  {
                // Refresh failed - clear auth
                authService.logout();
                set({
                  user: null,
                  token: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: null,
                  isInitialized: true,
                });
                return;
              }
            }
            
            // Token is valid
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isInitialized: true,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              isInitialized: true,
            });
          }
        } catch {
          // On error, clear auth
          authService.logout();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitialized: true,
          });
        }
      },

  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      // Set isInitialized to true since we just authenticated successfully
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Sign up user
   */
  signup: async (credentials: SignupCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup(credentials);
      // Set isInitialized to true since we just authenticated successfully
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Login with OAuth (Google)
   */
  loginWithOAuth: (accessToken: string, user: any) => {
    // Set isInitialized to true since we just authenticated successfully
    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isInitialized: true,
    });
  },

  /**
   * Logout user
   */
  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async () => {
    set({ isLoading: true, error: null });
    try {
      const newToken = await authService.refreshToken();
      set({
        token: newToken,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      set({
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Update token in store (used by apiClient after successful refresh)
   */
  updateToken: (token: string) => {
    set({ token, error: null });
  },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      // Persist auth state to localStorage for session persistence
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        // Note: _hasHydrated is NOT persisted - it's runtime state
      }),
      // Called when hydration is finished
      onRehydrateStorage: () => (state) => {
        // Mark hydration as complete
        state?.setHasHydrated(true);
      },
    }
  )
);
