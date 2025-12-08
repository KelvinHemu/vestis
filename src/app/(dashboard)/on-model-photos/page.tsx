"use client";

import { OnModelPhotos } from "@/features/generation/components/OnModelPhotos";

/* ============================================
   On-Model Photos Page
   Create product images on virtual models
   ============================================ */

// Force dynamic rendering - this page uses user session and makes API calls
export const dynamic = "force-dynamic";

export default function OnModelPhotosPage() {
  return <OnModelPhotos />;
}
