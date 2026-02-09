"use client";

/**
 * ShopFooter - Clean minimal footer inspired by NOOON
 * 
 * Design:
 * - Horizontal nav links (Policy, Shipping, Contact)
 * - Copyright with year
 * - All text centered and minimal
 */

import Link from "next/link";

// ============================================================================
// Props
// ============================================================================

interface ShopFooterProps {
  shopName: string;
  shopSlug?: string;
  showLinks?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ShopFooter({ shopName, shopSlug, showLinks = true }: ShopFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-neutral-100 py-8 md:py-10">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Navigation Links */}
        {showLinks && shopSlug && (
          <nav className="flex items-center justify-center gap-6 md:gap-10 mb-6">
            <Link
              href={`/shop/${shopSlug}?view=policy`}
              className="text-xs md:text-sm font-medium tracking-wide uppercase text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Policy
            </Link>

            <Link
              href={`/shop/${shopSlug}?view=contact`}
              className="text-xs md:text-sm font-medium tracking-wide uppercase text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
        )}

        {/* Copyright */}
        <p className="text-center text-xs md:text-sm tracking-wide text-neutral-400 uppercase">
          {currentYear} © {shopName.toUpperCase()}
        </p>
      </div>
    </footer>
  );
}

export default ShopFooter;
