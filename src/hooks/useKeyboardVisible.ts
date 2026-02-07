"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Detects mobile keyboard visibility using the VisualViewport API.
 * Falls back to focus-based detection when VisualViewport is unavailable.
 * 
 * Returns:
 * - isKeyboardVisible: whether the on-screen keyboard is likely open
 * - keyboardHeight: approximate keyboard height in px (0 when hidden)
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Only run on client / touch devices
    if (typeof window === 'undefined') return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth < 1024);

    if (!isMobile) return;

    const viewport = window.visualViewport;

    if (viewport) {
      // VisualViewport API — the gold standard for keyboard detection
      const KEYBOARD_THRESHOLD = 100; // px – ignore small viewport changes (toolbars, etc.)

      const handleResize = () => {
        const heightDiff = window.innerHeight - viewport.height;
        const visible = heightDiff > KEYBOARD_THRESHOLD;
        setIsKeyboardVisible(visible);
        setKeyboardHeight(visible ? heightDiff : 0);
      };

      viewport.addEventListener('resize', handleResize);
      // Run once to capture initial state
      handleResize();

      return () => {
        viewport.removeEventListener('resize', handleResize);
      };
    } else {
      // Fallback: listen for focus/blur on input elements
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
          setIsKeyboardVisible(true);
        }
      };

      const handleFocusOut = () => {
        // Small delay so we don't flash between focus changes
        setTimeout(() => {
          const active = document.activeElement;
          if (!active || (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA' && !(active as HTMLElement).isContentEditable)) {
            setIsKeyboardVisible(false);
            setKeyboardHeight(0);
          }
        }, 100);
      };

      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);

      return () => {
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
      };
    }
  }, []);

  return { isKeyboardVisible, keyboardHeight };
}
