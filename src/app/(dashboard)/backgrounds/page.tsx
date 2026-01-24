"use client";

import { BackgroundsPage } from "@/features/backgrounds/components";

/* ============================================
   Backgrounds Page Route
   Manage user-uploaded background images
   ============================================ */

// Force dynamic rendering - backgrounds list is updated when users upload new ones
export const dynamic = "force-dynamic";

export default function BackgroundsRoute() {
    return <BackgroundsPage />;
}
