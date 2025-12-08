"use client";

import { GenerationHistory } from "@/features/generation/components/GenerationHistory/GenerationHistory";

/* ============================================
   Projects Page Route
   View and manage saved projects (generations)
   Uses GenerationHistory component for now
   ============================================ */

// Force dynamic rendering - this page fetches user's generation history
export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return <GenerationHistory />;
}
