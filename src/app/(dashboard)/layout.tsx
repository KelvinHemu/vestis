"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/contexts/authStore";
import { processOAuthCallback } from "@/utils/oauthHelper";

/* ============================================
   Dashboard Layout
   Protected layout with sidebar navigation
   Redirects to login if not authenticated
   
   ALSO handles OAuth tokens if they arrive directly
   at /dashboard (backend redirects here with tokens)
   ============================================ */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, _hasHydrated, loginWithOAuth } = useAuthStore();
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const hasProcessedOAuth = useRef(false);

  // Check for and process OAuth tokens in URL hash
  // Backend redirects to /dashboard#access_token=... after OAuth
  useEffect(() => {
    // Only run once and only if there's a hash
    if (hasProcessedOAuth.current) return;
    if (typeof window === 'undefined') return;
    
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;

    console.log('🔐 Found OAuth tokens in dashboard URL, processing...');
    hasProcessedOAuth.current = true;
    setIsProcessingOAuth(true);

    try {
      const result = processOAuthCallback();
      
      if (result) {
        console.log('✅ OAuth tokens processed successfully');
        loginWithOAuth(result.accessToken, result.user);
        
        // Clean URL and let the component re-render with auth
        window.history.replaceState(null, "", window.location.pathname);
        
        // Small delay to ensure state is saved
        setTimeout(() => {
          setIsProcessingOAuth(false);
        }, 100);
      } else {
        console.error('❌ Failed to process OAuth tokens');
        setIsProcessingOAuth(false);
      }
    } catch (error) {
      console.error('❌ Error processing OAuth tokens:', error);
      setIsProcessingOAuth(false);
    }
  }, [loginWithOAuth]);

  // Redirect to login if not authenticated
  // IMPORTANT: Only redirect AFTER hydration is complete AND OAuth processing is done
  useEffect(() => {
    // Don't redirect while processing OAuth
    if (isProcessingOAuth) return;
    
    if (_hasHydrated && isInitialized && !isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to login...');
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, _hasHydrated, isProcessingOAuth, router]);

  // Show loading state while:
  // 1. Processing OAuth tokens from URL
  // 2. Zustand persist is hydrating from localStorage
  // 3. Auth state is being initialized
  if (isProcessingOAuth || !_hasHydrated || !isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm tracking-widest uppercase">
            {isProcessingOAuth ? 'Signing you in...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area - offset by sidebar width */}
      <main className="flex-1 ml-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
