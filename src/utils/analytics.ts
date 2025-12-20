/* ============================================
   Google Analytics 4 Integration
   Provides utility functions to interact with
   Google Analytics and track events
   ============================================ */

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (
            command: 'config' | 'event' | 'set',
            targetId: string,
            config?: Record<string, any>
        ) => void;
    }
}

/**
 * Track a custom event in Google Analytics
 * @param eventName - Name of the event
 * @param eventParams - Additional parameters for the event
 */
export function trackEvent(
    eventName: string,
    eventParams?: Record<string, any>
) {
    if (typeof window === 'undefined' || !window.gtag) {
        return;
    }

    try {
        window.gtag('event', eventName, eventParams);
        console.log(`📊 GA Event tracked: ${eventName}`, eventParams);
    } catch (error) {
        console.error('Failed to track GA event:', error);
    }
}

/**
 * Track a page view in Google Analytics
 * @param url - URL of the page
 * @param title - Title of the page
 */
export function trackPageView(url: string, title?: string) {
    if (typeof window === 'undefined' || !window.gtag) {
        return;
    }

    try {
        window.gtag('event', 'page_view', {
            page_path: url,
            page_title: title,
        });
        console.log(`📄 GA Page view tracked: ${url}`);
    } catch (error) {
        console.error('Failed to track GA page view:', error);
    }
}

/**
 * Set user properties in Google Analytics
 * @param userId - Unique identifier for the user
 * @param userProperties - Additional user properties
 */
export function setUserProperties(
    userId: string,
    userProperties?: Record<string, any>
) {
    if (typeof window === 'undefined' || !window.gtag) {
        return;
    }

    try {
        window.gtag('set', 'user_properties', {
            user_id: userId,
            ...userProperties,
        });
        console.log(`👤 GA User properties set for: ${userId}`);
    } catch (error) {
        console.error('Failed to set GA user properties:', error);
    }
}

/* ============================================
   Common Event Tracking Functions
   Pre-defined functions for common events
   ============================================ */

/**
 * Track user authentication events
 */
export const AuthEvents = {
    login: (method?: string) =>
        trackEvent('login', { method: method || 'email' }),

    signUp: (method?: string) =>
        trackEvent('sign_up', { method: method || 'email' }),

    logout: () =>
        trackEvent('logout'),
};

/**
 * Track feature usage events
 */
export const FeatureEvents = {
    generateImage: (feature: string, creditCost?: number) =>
        trackEvent('generate_image', {
            feature_type: feature,
            credit_cost: creditCost,
        }),

    uploadImage: (feature: string) =>
        trackEvent('image_upload', {
            feature_type: feature,
        }),

    downloadImage: (feature: string) =>
        trackEvent('image_download', {
            feature_type: feature,
        }),
};

/**
 * Track commerce events
 */
export const CommerceEvents = {
    viewPricing: () =>
        trackEvent('view_pricing'),

    purchaseCredits: (amount: number, value: number) =>
        trackEvent('purchase', {
            currency: 'USD',
            value: value,
            items: [{
                item_name: 'Credits',
                quantity: amount,
            }],
        }),

    addToCart: (itemName: string, amount: number, value: number) =>
        trackEvent('add_to_cart', {
            currency: 'USD',
            value: value,
            items: [{
                item_name: itemName,
                quantity: amount,
            }],
        }),
};

/**
 * Track engagement events
 */
export const EngagementEvents = {
    shareImage: (feature: string) =>
        trackEvent('share', {
            content_type: 'image',
            feature_type: feature,
        }),

    contactSupport: () =>
        trackEvent('contact_support'),

    viewTutorial: (tutorialName: string) =>
        trackEvent('view_tutorial', {
            tutorial_name: tutorialName,
        }),
};
