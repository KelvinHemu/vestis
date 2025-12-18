"use client";

import { FlatLayPhotos } from "@/features/generation/components/FlatLayPhotos";

/* ============================================
   Onboarding Flat-Lay Creation Flow
   Simplified flat-lay to model photo generation
   Part of first-time user onboarding
   ============================================ */

export const dynamic = "force-dynamic";

export default function OnboardingFlatLayPage() {
  // Pass isOnboarding prop to simplify the UI
  // Component will auto-select defaults and redirect to result page after generation
  return <FlatLayPhotos isOnboarding={true} />;
}

