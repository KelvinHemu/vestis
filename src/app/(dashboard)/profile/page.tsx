"use client";

import { Profile } from "@/features/auth/components/profile";

/* ============================================
   Profile Page Route
   User profile and account settings
   ============================================ */

// Force dynamic rendering - this page displays user-specific data
export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return <Profile />;
}
