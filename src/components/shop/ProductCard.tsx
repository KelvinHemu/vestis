"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatPrice, isThisWeek } from "@/services/shopService";
import type { ShopItem } from "@/types/shop";

interface ProductCardProps {
  item: ShopItem;
  shopSlug: string;
  compact?: boolean;
  showCategory?: boolean;
  showColors?: boolean;
}

export function ProductCard({ 
  item, 
  shopSlug, 
  compact = false,
  showCategory = true,
  showColors = false 
}: ProductCardProps) {
  const mainImage = item.images?.[0];
  const isNew = isThisWeek(item.created_at);

  return (
    <Link
      href={`/shop/${shopSlug}/item/${item.id}`}
      className="group block"
    >
      <div className={`relative rounded-lg overflow-hidden bg-white ${compact ? 'aspect-[3/4]' : 'aspect-[3/4]'}`}>
        {mainImage ? (
          <Image
            src={mainImage}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <span className="text-4xl text-muted-foreground">👔</span>
          </div>
        )}
        
        {/* Quick Add Button */}
        <button 
          className="absolute bottom-3 right-3 h-8 w-8 rounded-sm bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Add to cart functionality
          }}
        >
          <Plus className="h-4 w-4" />
        </button>

        {!item.is_available && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              Sold Out
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex justify-between items-start">
        <div className="flex-1 min-w-0">
          {item.category && showCategory && (
            <p className="text-xs text-muted-foreground mb-0.5">{item.category}</p>
          )}
          <h3 className={`font-medium truncate group-hover:text-primary transition-colors ${compact ? 'text-sm' : 'text-sm'}`}>
            {item.name}
          </h3>
          {showColors && item.colors && item.colors.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-300" />
              <span className="text-xs text-muted-foreground">+{item.colors.length}</span>
            </div>
          )}
        </div>
        {item.price > 0 && (
          <p className={`text-muted-foreground font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
            {formatPrice(item.price, item.currency)}
          </p>
        )}
      </div>
    </Link>
  );
}
