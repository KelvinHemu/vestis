"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { ShopItem } from "@/types/shop";

interface CatalogSectionProps {
  title: string;
  subtitle?: string;
  items: ShopItem[];
  shopSlug: string;
  itemCount?: number;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

export function CatalogSection({ 
  title, 
  subtitle,
  items, 
  shopSlug,
  itemCount,
  showSeeAll = true,
  onSeeAll 
}: CatalogSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemsPerView = 4;
  const maxScroll = Math.max(0, items.length - itemsPerView);

  const handlePrev = () => {
    setScrollPosition(Math.max(0, scrollPosition - itemsPerView));
  };

  const handleNext = () => {
    setScrollPosition(Math.min(maxScroll, scrollPosition + itemsPerView));
  };

  if (items.length === 0) return null;

  return (
    <section className="py-12 px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
                {title.split(' ').map((word, i) => (
                  <span key={i} className={i === 0 ? "block" : ""}>{word} </span>
                ))}
              </h2>
              {itemCount && (
                <span className="text-2xl text-primary font-medium">({itemCount})</span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {showSeeAll && (
              <button 
                onClick={onSeeAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                See All
              </button>
            )}
            {/* Navigation arrows */}
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={scrollPosition === 0}
                className="h-10 w-10 rounded-sm border border-neutral-300 flex items-center justify-center hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={scrollPosition >= maxScroll}
                className="h-10 w-10 rounded-sm border border-neutral-300 flex items-center justify-center hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid - Horizontal Scrollable */}
        <div className="relative overflow-hidden">
          <div 
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${scrollPosition * (100 / itemsPerView)}%)` }}
          >
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 w-[calc(25%-12px)]"
              >
                <ProductCard 
                  item={item} 
                  shopSlug={shopSlug} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
