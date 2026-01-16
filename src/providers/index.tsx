"use client";

import { type ReactNode, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/contexts/authStore";
import { ClarityProvider } from "@/components/shared/ClarityProvider";
import { ThemeProvider } from "./theme-provider";

/* ============================================
   Auth Provider - Initializes auth state
   Waits for Zustand persist hydration before
   calling initializeAuth to prevent race conditions
   ============================================ */
function AuthProvider({ children }: { children: ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Initialize auth state ONLY AFTER Zustand persist has hydrated
  // This prevents race conditions where we check auth before
  // localStorage state has been restored
  useEffect(() => {
    // Wait for hydration to complete
    if (!_hasHydrated) {
      console.log('⏳ Waiting for Zustand hydration...');
      return;
    }

    // Only initialize if not already initialized
    if (!isInitialized) {
      console.log('🔄 Initializing auth state...');
      initializeAuth();
    }
  }, [_hasHydrated, isInitialized, initializeAuth]);

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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
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


