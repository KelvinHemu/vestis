"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/contexts/authStore";

/* ============================================
   Home Page
   Redirects based on authentication status:
   - Authenticated: Dashboard
   - Not authenticated: Login
   
   Waits for Zustand hydration before redirecting
   ============================================ */

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for Zustand persist hydration AND auth initialization
    if (!_hasHydrated || !isInitialized) return;

    // Redirect based on auth status
    if (isAuthenticated) {
      console.log('✅ Authenticated, redirecting to dashboard...');
      router.replace("/dashboard");
    } else {
      console.log('🔒 Not authenticated, redirecting to login...');
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, _hasHydrated, router]);

  // Show loading state while determining auth status
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );
}
