"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/contexts/authStore";
import HeroSection from "@/components/hero-section";
import {
  Features,
  Testimonials,
  CTA,
  Footer
} from "@/components/landing";

/* ============================================
   Home Page - Tailark Style Landing
   Shows landing page for visitors, redirects
   authenticated users to dashboard
   ============================================ */

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, _hasHydrated } = useAuthStore();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    // Wait for Zustand persist hydration AND auth initialization
    if (!_hasHydrated || !isInitialized) return;

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      console.log('✅ Authenticated, redirecting to dashboard...');
      router.replace("/dashboard");
    } else {
      // Show landing page for unauthenticated users
      console.log('🏠 Showing landing page...');
      setShowLanding(true);
    }
  }, [isAuthenticated, isInitialized, _hasHydrated, router]);

  // Show loading state while determining auth status
  if (!showLanding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  // Render the stunning landing page
  return (
    <main className="min-h-screen bg-background">
      {/* Tailark Hero Section - includes header/navbar */}
      <HeroSection />

      {/* Features Grid - Core capabilities showcase */}
      <Features />



      {/* Social Proof - Testimonials & stats */}
      <Testimonials />

      {/* Final CTA - Conversion push with pricing */}
      <CTA />

      {/* Footer - Links and social */}
      <Footer />
    </main>
  );
}
