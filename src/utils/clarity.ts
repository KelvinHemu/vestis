/* ============================================
   Microsoft Clarity Integration
   Provides utility functions to initialize and
   interact with Microsoft Clarity analytics
   ============================================ */

import clarity from '@microsoft/clarity';

/**
 * Initialize Microsoft Clarity with your project ID
 * @param projectId - Your Clarity project ID from https://clarity.microsoft.com
 */
export function initClarity(projectId: string) {
    if (typeof window === 'undefined') {
        // Don't run on server-side
        return;
    }

    if (!projectId) {
        console.warn('Clarity project ID is not provided');
        return;
    }

    try {
        clarity.init(projectId);
        console.log('✅ Microsoft Clarity initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Clarity:', error);
    }
}

/**
 * Identify a user in Clarity
 * @param userId - Unique identifier for the user
 * @param sessionId - Optional session identifier
 * @param pageId - Optional page identifier
 * @param friendlyName - Optional friendly name for the user
 */
export function identifyClarityUser(
    userId: string,
    sessionId?: string,
    pageId?: string,
    friendlyName?: string
) {
    if (typeof window === 'undefined') return;

    try {
        clarity.identify(userId, sessionId, pageId, friendlyName);
    } catch (error) {
        console.error('Failed to identify user in Clarity:', error);
    }
}

/**
 * Set custom tags for Clarity sessions
 * @param key - Tag key
 * @param value - Tag value (string or array of strings)
 */
export function setClarityTag(key: string, value: string | string[]) {
    if (typeof window === 'undefined') return;

    try {
        clarity.setTag(key, value);
    } catch (error) {
        console.error('Failed to set Clarity tag:', error);
    }
}

/**
 * Upgrade the current session in Clarity
 * Useful for marking important sessions (e.g., when user makes a purchase)
 * @param reason - Reason for upgrading the session
 */
export function upgradeClaritySession(reason?: string) {
    if (typeof window === 'undefined') return;

    try {
        clarity.upgrade(reason || 'Session upgraded');
    } catch (error) {
        console.error('Failed to upgrade Clarity session:', error);
    }
}
