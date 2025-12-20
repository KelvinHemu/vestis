"use client";

import { useEffect } from 'react';
import { initClarity, identifyClarityUser, setClarityTag } from '@/utils/clarity';
import { useAuthStore } from '@/contexts/authStore';

/* ============================================
   Clarity Provider
   Initializes Microsoft Clarity and tracks
   authenticated user sessions
   ============================================ */

interface ClarityProviderProps {
    projectId: string;
    children: React.ReactNode;
}

export function ClarityProvider({ projectId, children }: ClarityProviderProps) {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Initialize Clarity on mount
    useEffect(() => {
        initClarity(projectId);
    }, [projectId]);

    // Identify user when authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            identifyClarityUser(
                String(user.id), // Convert to string
                undefined, // sessionId - Clarity will auto-generate
                undefined, // pageId - Clarity will auto-generate
                user.email || user.name || undefined // friendly name
            );

            // Set custom tags for better segmentation
            if (user.email) {
                setClarityTag('userEmail', user.email);
            }
            if (user.name) {
                setClarityTag('userName', user.name);
            }
            setClarityTag('userType', 'authenticated');
        }
    }, [isAuthenticated, user]);

    return <>{children}</>;
}
