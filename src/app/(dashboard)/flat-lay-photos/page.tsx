"use client";

import { FlatLayPhotos } from "@/features/generation/components/FlatLayPhotos";

/* ============================================
   Flat Lay Photos Page
   Create flat lay product images with AI
   ============================================ */

// Force dynamic rendering - this page uses user session and makes API calls
export const dynamic = "force-dynamic";

export default function FlatLayPhotosPage() {
  return <FlatLayPhotos />;
}
