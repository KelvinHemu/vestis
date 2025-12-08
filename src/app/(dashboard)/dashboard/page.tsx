"use client";

import { CreatePage } from "@/features/generation/components/CreatePage";

/* ============================================
   Dashboard Home Page
   Shows the main Create interface with feature cards
   ============================================ */

// Force dynamic rendering - this page uses user session data
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <CreatePage />;
}
