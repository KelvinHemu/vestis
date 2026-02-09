"use client";

/**
 * ShopHeader - Clean minimal header inspired by NOOON
 * 
 * Design:
 * - Centered brand name + tagline (braille-style pattern)
 * - Right-aligned CART (count) button
 */

import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";

// ============================================================================
// Props
// ============================================================================

interface ShopHeaderProps {
  shopSlug: string;
  shopName?: string;
  tagline?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ShopHeader({ shopSlug, shopName, tagline }: ShopHeaderProps) {
  const { openCart, getShopItemCount } = useCartStore();
  const itemCount = getShopItemCount(shopSlug);

  return (
    <header className="w-full bg-white py-6 md:py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="relative flex items-center justify-center">
          {/* Center - Brand Name & Tagline */}
          <Link 
            href={`/shop/${shopSlug}`}
            className="text-center group"
          >
            {/* Brand Name */}
            <h1 className="text-lg md:text-xl font-bold tracking-[0.2em] uppercase text-neutral-900">
              {shopName || "SHOP"}
            </h1>
            
            {/* Tagline - styled like braille pattern from NOOON */}
            {tagline && (
              <p className="mt-1 text-[10px] tracking-[0.3em] text-neutral-400 uppercase font-medium">
                {tagline}
              </p>
            )}
          </Link>

          {/* Right - Cart Button */}
          <button
            onClick={openCart}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-medium tracking-wide uppercase text-neutral-900 hover:text-neutral-600 transition-colors"
          >
            CART {itemCount > 0 && `(${itemCount})`}
          </button>
        </div>
      </div>
    </header>
  );
}

export default ShopHeader;
