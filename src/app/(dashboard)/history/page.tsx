"use client";

import { GenerationHistory } from "@/features/generation/components/GenerationHistory/GenerationHistory";

/* ============================================
   History Page Route
   View past AI generations
   ============================================ */

// Force dynamic rendering - this page fetches user's generation history
export const dynamic = "force-dynamic";

export default function HistoryPage() {
  return <GenerationHistory />;
}
