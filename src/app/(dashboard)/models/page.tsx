"use client";

import { ModelsPage } from "@/features/models/components/ModelsPage";

/* ============================================
   Models Page Route
   Browse and select virtual models
   ============================================ */

// Force dynamic rendering - models list is updated frequently with new additions
export const dynamic = "force-dynamic";

export default function ModelsRoute() {
  return <ModelsPage />;
}
