import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../contexts/authStore';

export function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuthStore();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Parse tokens from URL hash (format: #access_token=...&refresh_token=...&token_type=...&expires_in=...)
        const hash = location.hash.substring(1); // Remove the # symbol
        const params = new URLSearchParams(hash);
        
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const tokenType = params.get('token_type');
        
        console.log('OAuth tokens received:', { accessToken: !!accessToken, refreshToken: !!refreshToken, tokenType });

        if (!accessToken) {
          setError('Invalid OAuth callback: missing access token');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Store tokens in localStorage
        localStorage.setItem('auth_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        
        // Decode JWT to get user info (basic decode without verification since backend already verified)
        try {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          const user = {
            id: payload.user_id,
            email: payload.email,
          };
          
          // Store user info
          localStorage.setItem('auth_user', JSON.stringify(user));
          
          // Update auth store with user data and token
          loginWithOAuth(accessToken, user);
          
          console.log('Authentication successful, redirecting to dashboard...');
          
          // Redirect to dashboard
          navigate('/dashboard', { replace: true });
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
          setError('Failed to process authentication token');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [location.hash, navigate, loginWithOAuth]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <svg className="animate-spin mx-auto h-12 w-12 text-gray-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing you in...</h1>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
