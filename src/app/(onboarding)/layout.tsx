"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/contexts/authStore";
import Image from "next/image";

/* ============================================
   Onboarding Layout
   Clean, minimal layout for first-time user onboarding
   - No sidebar navigation
   - Simple header with logo only
   - Full-width content area
   - Redirects to login if not authenticated
   ============================================ */

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isInitialized, _hasHydrated, user } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (_hasHydrated && isInitialized && !isAuthenticated) {
      console.log('🔒 Not authenticated, redirecting to login...');
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, _hasHydrated, router]);

  // Redirect to dashboard if onboarding already completed
  useEffect(() => {
    if (_hasHydrated && isInitialized && isAuthenticated && user?.onboardingCompleted) {
      console.log('✅ Onboarding already completed, redirecting to dashboard...');
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, _hasHydrated, user, router]);

  // Show loading state while hydrating or initializing
  if (!_hasHydrated || !isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm tracking-widest uppercase">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if onboarding already completed (redirect in progress)
  if (user?.onboardingCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal header with logo only */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/Vestis.svg"
                alt="Vestis Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-semibold text-gray-900">
                Vestis
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Full-width content area */}
      <main className="min-h-[calc(100vh-73px)]">
        {children}
      </main>
    </div>
  );
}

