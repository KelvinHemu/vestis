"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  shopService,
  isThisWeek,
  isNewCollection,
  groupItemsExclusive
} from "@/services/shopService";
import { Loader2 } from "lucide-react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { HeroSection } from "@/components/shop/HeroSection";
import { CatalogSection } from "@/components/shop/CatalogSection";
import { CollectionGrid } from "@/components/shop/CollectionGrid";
import { ShopFooter } from "@/components/shop/ShopFooter";

export default function PublicShopPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Fetch shop data
  const { data: shop, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: () => shopService.getPublicShop(slug),
  });

  // Fetch shop items
  const { data: itemsResponse, isLoading: itemsLoading } = useQuery({
    queryKey: ["public-shop-items", slug],
    queryFn: () => shopService.getPublicShopItems(slug, { 
      available_only: true 
    }),
    enabled: !!shop,
  });

  const items = itemsResponse?.items || [];

  // Get items for different sections
  const newCollectionItems = useMemo(() => 
    items.filter((item) => isNewCollection(item.created_at)),
    [items]
  );

  const thisWeekItems = useMemo(() => 
    items.filter((item) => isThisWeek(item.created_at)),
    [items]
  );

  // Group items by catalog
  const catalogGroups = useMemo(() => {
    return groupItemsExclusive(items);
  }, [items]);

  // Get remaining items (older items not in special groups)
  const olderItems = useMemo(() => {
    const newIds = new Set(newCollectionItems.map(i => i.id));
    const weekIds = new Set(thisWeekItems.map(i => i.id));
    return items.filter(item => !newIds.has(item.id) && !weekIds.has(item.id));
  }, [items, newCollectionItems, thisWeekItems]);

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#e8e8e5]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#e8e8e5]">
        <h1 className="text-2xl font-bold mb-2">Shop Not Found</h1>
        <p className="text-muted-foreground text-center">
          The shop you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#e8e8e5]" 
      style={{ fontFamily: "'Beatrice Deck Trial', sans-serif" }}
    >
      {/* Shop Header */}
      <ShopHeader shopSlug={slug} shopName={shop.name} />

      {/* Hero Section with New Collection */}
      <HeroSection 
        shopSlug={slug} 
        items={newCollectionItems.length > 0 ? newCollectionItems : items.slice(0, 6)} 
      />

      {/* New This Week Section */}
      {thisWeekItems.length > 0 && (
        <CatalogSection
          title="NEW THIS WEEK"
          items={thisWeekItems}
          shopSlug={slug}
          itemCount={thisWeekItems.length}
          showSeeAll={thisWeekItems.length > 4}
        />
      )}

      {/* User Catalogs */}
      {catalogGroups?.userCatalogs.map((catalog) => (
        <CatalogSection
          key={catalog.name}
          title={catalog.displayName}
          items={catalog.items}
          shopSlug={slug}
          itemCount={catalog.items.length}
          showSeeAll={catalog.items.length > 4}
        />
      ))}

      {/* Collections Grid - Show all remaining items */}
      {olderItems.length > 0 && (
        <CollectionGrid
          title={`${shop.name} COLLECTIONS`}
          subtitle="23-24"
          items={olderItems}
          shopSlug={slug}
        />
      )}

      {/* If no items at all, show a message */}
      {items.length === 0 && !itemsLoading && (
        <div className="py-24 text-center">
          <p className="text-muted-foreground text-lg">
            No products available yet. Check back soon!
          </p>
        </div>
      )}

      {/* Footer */}
      <ShopFooter shopName={shop.name} />
    </div>
  );
}
