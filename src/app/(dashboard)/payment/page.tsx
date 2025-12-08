"use client";

import { PaymentPage } from "@/features/billing/components/PaymentPage";

/* ============================================
   Payment Page Route
   Credit packages and payment processing
   ============================================ */

// Force dynamic rendering - this page fetches user credit balance and payment history
export const dynamic = "force-dynamic";

export default function PaymentRoute() {
  return <PaymentPage />;
}
