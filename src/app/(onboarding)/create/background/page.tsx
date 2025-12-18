"use client";

import { BackgroundChange } from "@/components/backgrounChange";

/* ============================================
   Onboarding Background Change Flow
   Simplified background change generation
   Part of first-time user onboarding
   ============================================ */

export const dynamic = "force-dynamic";

export default function OnboardingBackgroundChangePage() {
  // Pass isOnboarding prop to simplify the UI
  // Component will auto-select defaults and redirect to result page after generation
  return <BackgroundChange isOnboarding={true} />;
}

