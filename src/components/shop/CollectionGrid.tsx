"use client";

import { ProductCard } from "./ProductCard";
import type { ShopItem } from "@/types/shop";

interface CollectionGridProps {
  title: string;
  subtitle?: string;
  items: ShopItem[];
  shopSlug: string;
  showFilters?: boolean;
}

export function CollectionGrid({ 
  title, 
  subtitle,
  items, 
  shopSlug,
  showFilters = true
}: CollectionGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-12 px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
              {title.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-6 text-sm">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Filters(+)
              </button>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Sorts(-)</span>
                <span className="text-foreground">Less to more</span>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ProductCard 
              key={item.id}
              item={item} 
              shopSlug={shopSlug} 
              showCategory={true}
              showColors={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
