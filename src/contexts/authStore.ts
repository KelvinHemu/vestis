import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginCredentials, SignupCredentials, SignupResponse } from '../types/auth';
import authService from '../services/authService';
import { isTokenExpired } from '../utils/tokenHelper';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<SignupResponse>;
  loginWithOAuth: (accessToken: string, user: any) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateToken: (token: string) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  isInitialized: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  // Email verification
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
  needsVerification: boolean;
  setNeedsVerification: (needs: boolean) => void;
  
  // Onboarding management
  // Track user's onboarding progress and intent
  updateOnboardingStatus: (completed: boolean) => void;
  setUserIntent: (intent: 'on_model' | 'flat_lay' | 'mannequin' | 'background_change') => void;
  getOnboardingStatus: () => boolean;
  onboardingProgress: string | null;
  setOnboardingProgress: (step: string | null) => void;
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
      pendingVerificationEmail: null,
      needsVerification: false,
      onboardingProgress: null,

      /**
       * Set hydration state - called by persist middleware
       */
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      /**
       * Set pending verification email
       */
      setPendingVerificationEmail: (email: string | null) => {
        set({ pendingVerificationEmail: email });
      },

      /**
       * Set needs verification flag
       */
      setNeedsVerification: (needs: boolean) => {
        set({ needsVerification: needs });
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
              } catch {
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
        set({ isLoading: true, error: null, needsVerification: false });
        try {
          const response = await authService.login(credentials);
          // Set isInitialized to true since we just authenticated successfully
          // User object now includes credits from the backend
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isInitialized: true,
            needsVerification: false,
          });
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          const needsVerification = error?.needs_verification === true;
          const email = error?.email || credentials.email;

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
            needsVerification,
            pendingVerificationEmail: needsVerification ? email : null,
          });
          throw error;
        }
      },

      /**
       * Sign up user - returns message, does NOT log in
       */
      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.signup(credentials);
          // Do NOT set isAuthenticated - user must verify email first
          set({
            isLoading: false,
            error: null,
            pendingVerificationEmail: response.email,
          });
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Signup failed';
          set({
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

      /**
       * Update onboarding completion status
       * Marks user as having completed the onboarding flow
       */
      updateOnboardingStatus: (completed: boolean) => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, onboardingCompleted: completed };
          set({ user: updatedUser });
          authService.storeUser(updatedUser);
        }
      },

      /**
       * Set user's creation intent during onboarding
       * Stores which type of generation the user wants to create
       */
      setUserIntent: (intent: 'on_model' | 'flat_lay' | 'mannequin' | 'background_change') => {
        const { user } = get();
        if (user) {
          const updatedUser = { ...user, intent };
          set({ user: updatedUser });
          authService.storeUser(updatedUser);
        }
      },

      /**
       * Get onboarding status
       * Returns true if user has completed onboarding, false otherwise
       */
      getOnboardingStatus: () => {
        const { user } = get();
        return user?.onboardingCompleted ?? false;
      },

      /**
       * Set onboarding progress step
       * Tracks which step of onboarding the user is on for resumption
       */
      setOnboardingProgress: (step: string | null) => {
        set({ onboardingProgress: step });
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
        onboardingProgress: state.onboardingProgress,
        // Note: _hasHydrated is NOT persisted - it's runtime state
        // Note: onboarding fields are persisted within user object
      }),
      // Called when hydration is finished
      onRehydrateStorage: () => (state) => {
        // Mark hydration as complete
        state?.setHasHydrated(true);
      },
    }
  )
);
