"use client";

/**
 * ProductCard - Clean minimal product card inspired by NOOON
 * 
 * Design:
 * - VERY large product image on white background (fills viewport like NOOON)
 * - Hover to show second image (if available)
 * - Centered product name (uppercase)
 * - Centered price
 * - No extra decorations - pure minimalism
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/services/shopService";
import type { ShopItem } from "@/types/shop";

// ============================================================================
// Props
// ============================================================================

interface ProductCardProps {
  item: ShopItem;
  shopSlug: string;
}

// ============================================================================
// Component
// ============================================================================

export function ProductCard({ item, shopSlug }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get primary and secondary images
  const primaryImage = item.images?.[0];
  const secondaryImage = item.images?.[1];
  const hasSecondImage = !!secondaryImage;

  return (
    <Link
      href={`/shop/${shopSlug}/item/${item.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image - VERY tall aspect ratio like NOOON (almost square to viewport) */}
      <div className="relative aspect-[2/3] bg-white overflow-hidden">
        {primaryImage ? (
          <>
            {/* Primary Image */}
            <Image
              src={primaryImage}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className={`object-contain transition-opacity duration-300 ${
                isHovered && hasSecondImage ? "opacity-0" : "opacity-100"
              }`}
              priority={false}
            />
            
            {/* Secondary Image (shown on hover) */}
            {hasSecondImage && (
              <Image
                src={secondaryImage}
                alt={`${item.name} - alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className={`object-contain transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                priority={false}
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
            <span className="text-8xl text-neutral-200">👔</span>
          </div>
        )}

        {/* Sold Out Overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-medium tracking-widest uppercase text-neutral-500">
              Sold Out
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="mt-4 text-center">
        {/* Product Name */}
        <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wide text-neutral-900 group-hover:underline transition-all">
          {item.name}
        </h3>
        
        {/* Price */}
        {item.price > 0 && (
          <p className="mt-1 text-xs sm:text-sm text-neutral-500">
            {formatPrice(item.price, item.currency)}
          </p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;
