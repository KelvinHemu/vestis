"use client";

import { MannequinPhotos } from "@/components/MannequinPhotos";

/* ============================================
   Onboarding Mannequin Creation Flow
   Simplified mannequin to model photo generation
   Part of first-time user onboarding
   ============================================ */

export const dynamic = "force-dynamic";

export default function OnboardingMannequinPage() {
  // Pass isOnboarding prop to simplify the UI
  // Component will auto-select defaults and redirect to result page after generation
  return <MannequinPhotos isOnboarding={true} />;
}

