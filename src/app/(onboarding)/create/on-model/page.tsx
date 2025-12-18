"use client";

import { OnModelPhotos } from "@/features/generation/components/OnModelPhotos";

/* ============================================
   Onboarding On-Model Creation Flow
   Simplified on-model fashion photo generation
   Part of first-time user onboarding
   ============================================ */

export const dynamic = "force-dynamic";

export default function OnboardingOnModelPage() {
  // Pass isOnboarding prop to simplify the UI
  // Component will auto-select defaults and redirect to result page after generation
  return <OnModelPhotos isOnboarding={true} />;
}

