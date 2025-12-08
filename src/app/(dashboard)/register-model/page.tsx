"use client";

import { RegisterModel } from "@/features/models/components/RegisterModel";

/* ============================================
   Register Model Page
   Become a model registration form
   ============================================ */

// Force dynamic rendering - this page uses user session and makes API calls
export const dynamic = "force-dynamic";

export default function RegisterModelPage() {
  return <RegisterModel />;
}
