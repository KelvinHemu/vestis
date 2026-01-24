"use client";

import { AddBackgroundPage } from "@/features/backgrounds/components/AddBackgroundPage";

/* ============================================
   Add Background Page Route
   Upload new custom background images
   ============================================ */

// Force dynamic rendering - this page makes API calls for uploads
export const dynamic = "force-dynamic";

export default function AddBackgroundRoute() {
    return <AddBackgroundPage />;
}

