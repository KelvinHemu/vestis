"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/contexts/authStore';
import { processOAuthCallback } from '@/utils/oauthHelper';

/* ============================================
   OAuth Callback Component
   Handles the OAuth redirect callback from 
   Google and processes authentication tokens
   
   Uses a small delay after setting auth state
   to ensure Zustand persist has time to save
   ============================================ */

export function OAuthCallback() {
  const router = useRouter();
  const { loginWithOAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState<string>('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double-processing in React Strict Mode
    if (hasProcessed.current) return;
    
    const handleCallback = async () => {
      try {
        console.log('🔐 Processing OAuth callback...');
        console.log('📍 Current URL:', window.location.href);
        console.log('🔗 URL Hash:', window.location.hash);
        
        // Use the OAuth helper to process tokens from URL hash
        const result = processOAuthCallback();
        
        // Validate we received the tokens and user info
        if (!result) {
          console.error('❌ No tokens found in URL hash');
          setError('Invalid OAuth callback: missing access token');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        console.log('📦 OAuth result:', { 
          hasToken: !!result.accessToken, 
          user: result.user 
        });

        // Mark as processed to prevent re-runs
        hasProcessed.current = true;

        // Update auth store with user data and token
        loginWithOAuth(result.accessToken, result.user);
        
        console.log('✅ Auth store updated');
        
        // Small delay to ensure Zustand persist saves to localStorage
        // This prevents race conditions where redirect happens before persist
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🚀 Redirecting to dashboard...');
        
        // Redirect to dashboard
        router.replace('/dashboard');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed. Please try again.';
        console.error('❌ OAuth callback error:', err);
        setError(errorMessage);
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router, loginWithOAuth]);

  // Log when isAuthenticated changes
  useEffect(() => {
    console.log('🔄 isAuthenticated changed:', isAuthenticated);
  }, [isAuthenticated]);

  // Error State UI
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  // Loading State UI
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="mb-4">
          <svg className="animate-spin mx-auto h-12 w-12 text-gray-900" fill="none" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing you in...</h1>
        <p className="text-gray-600">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
