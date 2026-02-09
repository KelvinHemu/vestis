"use client";

/**
 * Public Shop Page - Clean minimal design inspired by NOOON
 * 
 * Features:
 * - Clean header with brand name and cart
 * - Product grid: 3 columns on desktop, 2 on mobile
 * - LARGE product cards that fill the viewport like NOOON
 * - Cart drawer functionality
 */

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { Loader2 } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { SHOP_CURSOR_STYLE } from "@/components/shop/shopCursor";

// ============================================================================
// Page Component
// ============================================================================

export default function PublicShopPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Fetch shop data
  const { 
    data: shop, 
    isLoading: shopLoading, 
    error: shopError 
  } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: () => shopService.getPublicShop(slug),
  });

  // Fetch shop items
  const { 
    data: itemsResponse, 
    isLoading: itemsLoading 
  } = useQuery({
    queryKey: ["public-shop-items", slug],
    queryFn: () => shopService.getPublicShopItems(slug, { 
      available_only: false // Show all items, sold out will be marked
    }),
    enabled: !!shop,
  });

  const items = itemsResponse?.items || [];

  // -------------------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------------------
  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Error State
  // -------------------------------------------------------------------------
  if (shopError || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
        <h1 className="text-lg font-medium tracking-wide uppercase mb-2">
          Shop Not Found
        </h1>
        <p className="text-sm text-neutral-500 text-center">
          The shop you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Beatrice Deck Trial', sans-serif", ...SHOP_CURSOR_STYLE }}>
      {/* Header */}
      <ShopHeader 
        shopSlug={slug} 
        shopName={shop.name}
        tagline={shop.tagline || shop.bio}
      />

      {/* Main Content - Minimal padding like NOOON to maximize image size */}
      <main className="flex-1 px-2 sm:px-4 md:px-6 lg:px-8 pb-16">
        <div className="max-w-[1800px] mx-auto">
          {/* Product Grid */}
          {itemsLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-sm text-neutral-500 uppercase tracking-wide">
                No products available yet
              </p>
            </div>
          ) : (
            // NOOON-style grid: minimal gaps, images fill the space
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-1 gap-y-8 sm:gap-x-2 sm:gap-y-10 md:gap-x-4 md:gap-y-12">
              {items.map((item) => (
                <ProductCard 
                  key={item.id} 
                  item={item} 
                  shopSlug={slug} 
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <ShopFooter 
        shopName={shop.name} 
        shopSlug={slug}
      />

      {/* Cart Drawer */}
      <CartDrawer 
        shopSlug={slug} 
        shop={shop} 
      />
    </div>
  );
}
