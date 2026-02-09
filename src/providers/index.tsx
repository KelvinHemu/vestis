"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/contexts/authStore";
import { ClarityProvider } from "@/components/shared/ClarityProvider";
import { ThemeProvider } from "./theme-provider";
import authService from "@/services/authService";
import { getTokenExpiration } from "@/utils/tokenHelper";

/* ============================================
   Auth Provider - Initializes auth state
   Waits for Zustand persist hydration before
   calling initializeAuth to prevent race conditions.
   Also schedules a silent background refresh so
   users are never logged out unexpectedly.
   ============================================ */
function AuthProvider({ children }: { children: ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const updateToken = useAuthStore((state) => state.updateToken);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize auth state ONLY AFTER Zustand persist has hydrated
  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }
    if (!isInitialized) {
      initializeAuth();
    }
  }, [_hasHydrated, isInitialized, initializeAuth]);

  // ── Background token refresh scheduler ──
  // Schedules a silent refresh 60 seconds before the access token expires.
  useEffect(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (!isAuthenticated || !token) return;

    const expiry = getTokenExpiration(token);
    if (!expiry) return;

    // Refresh 60 seconds before expiry (minimum 5 seconds from now)
    const msUntilRefresh = Math.max(expiry.getTime() - Date.now() - 60_000, 5_000);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const newToken = await authService.refreshToken();
        updateToken(newToken);
      } catch {
        // Silently fail — the next API call will handle refresh reactively
      }
    }, msUntilRefresh);

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, token, updateToken]);

  return <>{children}</>;
}

/* ============================================
   Root Providers - Wraps app with all providers
   - QueryClientProvider for React Query
   - AuthProvider for authentication state
   - ClarityProvider for Microsoft Clarity analytics
   ============================================ */
export function Providers({ children }: { children: ReactNode }) {
  // Get Clarity Project ID from environment variable
  // You can find this in your Microsoft Clarity dashboard
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="vestis-theme"
        >
          {clarityProjectId && (
            <ClarityProvider projectId={clarityProjectId}>
              {children}
            </ClarityProvider>
          )}
          {!clarityProjectId && children}
        </ThemeProvider>
      </AuthProvider>
      {/* DevTools only visible in development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}


