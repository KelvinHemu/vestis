import type { AuthResponse, LoginCredentials, SignupCredentials, OAuthResponse, SignupResponse, VerifyEmailResponse, ResendVerificationResponse } from '../types/auth';
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/config/api';
import { logger } from '@/utils/logger';

const TOKEN_KEY = STORAGE_KEYS.authToken;
const REFRESH_TOKEN_KEY = STORAGE_KEYS.refreshToken;
const USER_KEY = STORAGE_KEYS.user;

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        // Check if email needs verification
        if (error.needs_verification) {
          const verificationError = new Error(error.error || 'Please verify your email before logging in');
          (verificationError as any).needs_verification = true;
          (verificationError as any).email = credentials.email;
          throw verificationError;
        }
        // Throw error with message from API or default
        throw new Error(error.error || error.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      this.storeToken(data.access_token);
      this.storeUser(data.user);
      this.storeRefreshToken(data.refresh_token);

      return data;
    } catch (error) {
      // Re-throw to be handled by error handler
      throw error;
    }
  }

  /**
   * Sign up with email and password
   * Returns a message to check email - does NOT log in the user
   */
  async signup(credentials: SignupCredentials): Promise<SignupResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Signup failed');
      }

      const data = await response.json();

      // Return message-based response - do NOT store tokens
      // User must verify email before they can log in
      return {
        message: data.message || 'Please check your email to verify your account',
        email: credentials.email,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email with token from verification link
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/verify?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Email verification failed');
      }

      const data = await response.json();
      return {
        message: data.message || 'Email verified successfully',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<ResendVerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to resend verification email');
      }

      const data = await response.json();
      return {
        message: data.message || 'Verification email sent',
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initiate Google OAuth login flow
   */
  initiateGoogleLogin(): void {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_BASE_URL}/v1/auth/google`;
  }

  /**
   * Handle OAuth callback and store tokens
   */
  async handleOAuthCallback(code: string, state: string): Promise<OAuthResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/auth/google/callback?code=${code}&state=${state}`,
        {
          method: 'GET',
          credentials: 'include', // Include cookies for state validation
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'OAuth authentication failed');
      }

      const data: OAuthResponse = await response.json();

      // Store tokens and user
      this.storeToken(data.access_token);
      this.storeRefreshToken(data.refresh_token);
      this.storeUser(data.user);

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout - clear token and user from storage
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get stored user
   */
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Refresh authentication token
   * Uses the refresh token to get a new access token without logging out
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        this.logout();
        throw new Error('Session expired');
      }

      const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        // Refresh token expired or invalid - logout
        this.logout();
        throw new Error('Session expired');
      }

      const data = await response.json();

      // Handle both 'token' and 'access_token' response formats
      const newAccessToken = data.access_token || data.token;

      if (!newAccessToken) {
        this.logout();
        throw new Error('Invalid refresh response');
      }

      // Store the new access token
      this.storeToken(newAccessToken);

      // Store new refresh token if provided
      if (data.refresh_token) {
        this.storeRefreshToken(data.refresh_token);
      }

      console.log('✅ Token refreshed successfully');
      return newAccessToken;
    } catch (error) {
      console.error('🔴 Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Verify current token validity
   */
  async verifyToken(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/v1/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.valid === true;
    } catch {
      return false;
    }
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Store token in localStorage
   */
  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Store refresh token in localStorage
   */
  private storeRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Store user in localStorage
   * Made public to allow authStore to update user object
   */
  storeUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export default new AuthService();
