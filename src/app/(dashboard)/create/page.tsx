"use client";

import { CreatePage } from "@/features/generation/components/CreatePage";

/* ============================================
   Create Page Route
   Main creation studio with AI chat interface
   ============================================ */

// Force dynamic rendering - this page uses user session and makes API calls
export const dynamic = "force-dynamic";

export default function CreateRoute() {
  return <CreatePage />;
}
