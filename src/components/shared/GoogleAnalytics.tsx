"use client";

import { Suspense, useEffect } from 'react';
import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView, setUserProperties } from '@/utils/analytics';
import { useAuthStore } from '@/contexts/authStore';

/* ============================================
   Google Analytics Provider
   Initializes GA4 and tracks page views and
   authenticated user sessions
   ============================================ */

interface GoogleAnalyticsProps {
    measurementId: string;
}

// Inner component that uses useSearchParams (requires Suspense boundary)
function GoogleAnalyticsInner({ measurementId }: GoogleAnalyticsProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // Track page views on route change
    useEffect(() => {
        if (pathname) {
            const url = searchParams.toString()
                ? `${pathname}?${searchParams.toString()}`
                : pathname;

            trackPageView(url, document.title);
        }
    }, [pathname, searchParams]);

    // Set user properties when authenticated
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            setUserProperties(String(user.id), {
                user_email: user.email,
                user_name: user.name,
                user_type: 'authenticated',
            });
        }
    }, [isAuthenticated, user]);

    return <NextGoogleAnalytics gaId={measurementId} />;
}

// Wrapper component with Suspense boundary for Next.js static generation
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    return (
        <Suspense fallback={null}>
            <GoogleAnalyticsInner measurementId={measurementId} />
        </Suspense>
    );
}
