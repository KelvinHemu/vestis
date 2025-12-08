"use client";

import { BackgroundChange } from "@/features/generation/components/BackgroundChange";

/* ============================================
   Background Change Page
   Change product image backgrounds with AI
   ============================================ */

// Force dynamic rendering - this page uses user session and makes API calls
export const dynamic = "force-dynamic";

export default function BackgroundChangePage() {
  return <BackgroundChange />;
}
