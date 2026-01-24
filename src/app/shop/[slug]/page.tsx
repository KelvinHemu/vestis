"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService, formatPrice } from "@/services/shopService";
import type { ShopItem } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Mail, Phone, MapPin, Instagram, Facebook, Globe, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Social icon mapping
const SocialIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-5 w-5" />;
    case "facebook":
      return <Facebook className="h-5 w-5" />;
    case "tiktok":
      return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    default:
      return <Globe className="h-5 w-5" />;
  }
};

export default function PublicShopPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch shop data
  const { data: shop, isLoading: shopLoading, error: shopError } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: () => shopService.getPublicShop(slug),
  });

  // Fetch shop items
  const { data: itemsResponse, isLoading: itemsLoading } = useQuery({
    queryKey: ["public-shop-items", slug, selectedCategory],
    queryFn: () => shopService.getPublicShopItems(slug, { 
      category: selectedCategory || undefined,
      available_only: true 
    }),
    enabled: !!shop,
  });

  const items = itemsResponse?.items || [];

  // Filter items by search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get unique categories
  const categories = [...new Set(items.map((item) => item.category).filter(Boolean))];

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (shopError || !shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold mb-2">Shop Not Found</h1>
        <p className="text-muted-foreground text-center">
          The shop you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Banner */}
      <div className="relative">
        {shop.banner_image ? (
          <div className="relative h-48 md:h-64 w-full">
            <Image
              src={shop.banner_image}
              alt={shop.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        ) : (
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 to-primary/10" />
        )}

        {/* Shop Info */}
        <div className="container max-w-5xl mx-auto px-4">
          <div className="relative -mt-16 md:-mt-20 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Logo */}
              {shop.logo_image ? (
                <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-white">
                  <Image
                    src={shop.logo_image}
                    alt={shop.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl border-4 border-background shadow-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-bold text-primary">
                    {shop.name[0].toUpperCase()}
                  </span>
                </div>
              )}

              {/* Shop Details */}
              <div className="flex-1 pb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{shop.name}</h1>
                {shop.tagline && (
                  <p className="text-muted-foreground">{shop.tagline}</p>
                )}
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2">
                {shop.whatsapp && (
                  <Button asChild className="gap-2 bg-green-600 hover:bg-green-700">
                    <a href={`https://wa.me/${shop.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </Button>
                )}
                {shop.email && (
                  <Button variant="outline" asChild className="gap-2">
                    <a href={`mailto:${shop.email}`}>
                      <Mail className="h-4 w-4" />
                      <span className="hidden sm:inline">Email</span>
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Bio & Contact Info */}
            <div className="mt-4 space-y-2">
              {shop.bio && (
                <p className="text-muted-foreground max-w-2xl">{shop.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {shop.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {shop.location}
                  </span>
                )}
                {shop.phone && (
                  <a href={`tel:${shop.phone}`} className="flex items-center gap-1 hover:text-foreground">
                    <Phone className="h-4 w-4" />
                    {shop.phone}
                  </a>
                )}
              </div>

              {/* Social Links */}
              {shop.social_links && Object.keys(shop.social_links).length > 0 && (
                <div className="flex gap-3 pt-2">
                  {Object.entries(shop.social_links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <SocialIcon platform={platform} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {categories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category!)}
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {itemsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "No products match your search" : "No products available yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredItems.map((item) => (
              <ProductCard key={item.id} item={item} shopSlug={slug} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {shop.name}. Powered by Vestis</p>
        </div>
      </footer>
    </div>
  );
}

// Product Card Component
function ProductCard({ item, shopSlug }: { item: ShopItem; shopSlug: string }) {
  const mainImage = item.images?.[0];

  return (
    <Link
      href={`/shop/${shopSlug}/item/${item.id}`}
      className="group block"
    >
      <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-muted">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={item.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">👔</span>
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-medium truncate group-hover:text-primary transition-colors">
          {item.name}
        </h3>
        {item.price > 0 && (
          <p className="text-sm text-muted-foreground">
            {formatPrice(item.price, item.currency)}
          </p>
        )}
        {item.sizes && item.sizes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {item.sizes.join(", ")}
          </p>
        )}
      </div>
    </Link>
  );
}
