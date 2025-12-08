"use client";

import { MannequinPhotos } from "@/features/generation/components/MannequinPhotos";

/* ============================================
   Mannequin Photos Page
   Create mannequin product images with AI
   ============================================ */

// Force dynamic rendering - this page uses user session and makes API calls
export const dynamic = "force-dynamic";

export default function MannequinPhotosPage() {
  return <MannequinPhotos />;
}
