import type { AuthResponse, LoginCredentials, SignupCredentials, OAuthResponse } from '../types/auth';

// Configure your API endpoint here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

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
        // Throw error with message from API or default
        throw new Error(error.error || error.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();
      this.storeToken(data.token);
      this.storeUser(data.user);
      
      // Store refresh token if provided
      if (data.refresh_token) {
        this.storeRefreshToken(data.refresh_token);
      }
      
      return data;
    } catch (error) {
      // Re-throw to be handled by error handler
      throw error;
    }
  }

  /**
   * Sign up with email, password, and name
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
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
        // Throw error with message from API or default
        throw new Error(error.error || error.message || 'Signup failed');
      }

      const data: AuthResponse = await response.json();
      this.storeToken(data.token);
      this.storeUser(data.user);
      
      // Store refresh token if provided
      if (data.refresh_token) {
        this.storeRefreshToken(data.refresh_token);
      }
      
      return data;
    } catch (error) {
      // Re-throw to be handled by error handler
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
   */
  private storeUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export default new AuthService();
