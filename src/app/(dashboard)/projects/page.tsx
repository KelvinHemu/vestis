"use client";

import { GenerationHistory } from "@/features/generation/components/GenerationHistory/GenerationHistory";

/* ============================================
   Projects Page Route
   View and manage saved projects (generations)
   Uses GenerationHistory component for now
   ============================================ */

export default function ProjectsPage() {
  return <GenerationHistory />;
}
