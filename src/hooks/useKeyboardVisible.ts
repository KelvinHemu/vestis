"use client";

import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';

/**
 * Detects mobile keyboard visibility using the VisualViewport API and
 * repositions a target element to sit at the bottom of the visual viewport.
 *
 * On iOS Safari, `position: fixed; bottom: 0` breaks when the keyboard opens
 * because the layout viewport stays the same height and the browser scrolls.
 * The fix is to absolutely position the element using visualViewport.offsetTop + height.
 *
 * Returns:
 * - isKeyboardVisible: boolean
 * - keyboardHeight: number (px)
 * - barRef: attach to the floating bar wrapper
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      ('ontouchstart' in window && window.innerWidth < 1024);

    if (!isMobile) return;

    const viewport = window.visualViewport;
    if (!viewport) return;

    const KEYBOARD_THRESHOLD = 100;

    const reposition = () => {
      const heightDiff = window.innerHeight - viewport.height;
      const visible = heightDiff > KEYBOARD_THRESHOLD;
      setIsKeyboardVisible(visible);
      setKeyboardHeight(visible ? heightDiff : 0);

      const el = barRef.current;
      if (!el) return;

      if (visible) {
        // Place the bar at the bottom of the visual viewport
        // Using translate so it doesn't cause layout shifts
        const top = viewport.offsetTop + viewport.height - el.offsetHeight;
        el.style.position = 'fixed';
        el.style.top = `${top}px`;
        el.style.bottom = 'auto';
        el.style.left = '0';
        el.style.right = '0';
      } else {
        // Reset — let CSS handle normal positioning
        el.style.position = '';
        el.style.top = '';
        el.style.bottom = '';
        el.style.left = '';
        el.style.right = '';
      }
    };

    viewport.addEventListener('resize', reposition);
    viewport.addEventListener('scroll', reposition);
    reposition();

    return () => {
      viewport.removeEventListener('resize', reposition);
      viewport.removeEventListener('scroll', reposition);
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight, barRef };
}
