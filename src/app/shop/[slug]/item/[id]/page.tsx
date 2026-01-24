"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService, formatPrice, generateWhatsAppLink, generateEmailLink } from "@/services/shopService";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, MessageCircle, Mail, ChevronLeft, ChevronRight, Share2, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PublicItemPage() {
  const params = useParams();
  const slug = params.slug as string;
  const itemId = parseInt(params.id as string);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch shop
  const { data: shop } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: () => shopService.getPublicShop(slug),
  });

  // Fetch item response (contains both item and shop)
  const { data: itemResponse, isLoading, error } = useQuery({
    queryKey: ["public-shop-item", slug, itemId],
    queryFn: () => shopService.getPublicShopItem(slug, itemId),
    enabled: !isNaN(itemId),
  });

  const item = itemResponse?.item;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.name,
          text: `Check out ${item?.name} at ${shop?.name}`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold mb-2">Item Not Found</h1>
        <p className="text-muted-foreground text-center mb-4">
          The item you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href={`/shop/${slug}`}>Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const images = item.images || [];
  const hasMultipleImages = images.length > 1;

  // Build inquiry message
  const buildInquiryMessage = () => {
    let msg = `Hi! I'm interested in "${item.name}"`;
    if (item.price > 0) {
      msg += ` (${formatPrice(item.price, item.currency)})`;
    }
    if (selectedSize) {
      msg += ` - Size: ${selectedSize}`;
    }
    if (selectedColor) {
      msg += ` - Color: ${selectedColor}`;
    }
    msg += `\n\nItem link: ${window.location.href}`;
    return msg;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/shop/${slug}`} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to {shop?.name || "Shop"}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[currentImageIndex]}
                    alt={item.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full shadow hover:bg-background"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full shadow hover:bg-background"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              idx === currentImageIndex ? "bg-primary" : "bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl text-muted-foreground">👔</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                      idx === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt={`${item.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            {item.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {item.category}
              </span>
            )}

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{item.name}</h1>
              {item.price > 0 && (
                <p className="text-2xl font-semibold mt-2">
                  {formatPrice(item.price, item.currency)}
                </p>
              )}
            </div>

            {/* Availability */}
            {!item.is_available && (
              <span className="inline-flex items-center px-4 py-1 rounded-full text-base font-medium bg-destructive text-destructive-foreground">
                Currently Unavailable
              </span>
            )}

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            {/* Sizes */}
            {item.sizes && item.sizes.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {item.colors && item.colors.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Select Color</h3>
                <div className="flex flex-wrap gap-2">
                  {item.colors.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Buttons */}
            {item.is_available && shop && (
              <div className="space-y-3 pt-4">
                <h3 className="font-medium">Interested? Contact us:</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {shop.whatsapp && (
                    <Button
                      asChild
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <a
                        href={generateWhatsAppLink(shop.whatsapp, buildInquiryMessage())}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Inquire via WhatsApp
                      </a>
                    </Button>
                  )}
                  {shop.email && (
                    <Button
                      variant="outline"
                      asChild
                      className="flex-1 gap-2"
                      size="lg"
                    >
                      <a
                        href={generateEmailLink(
                          shop.email,
                          `Inquiry about ${item.name}`,
                          buildInquiryMessage()
                        )}
                      >
                        <Mail className="h-5 w-5" />
                        Inquire via Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Shop Info */}
            {shop && (
              <div className="pt-6 border-t">
                <Link
                  href={`/shop/${slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  {shop.logo_image ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image src={shop.logo_image} alt={shop.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {shop.name[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{shop.name}</p>
                    <p className="text-sm text-muted-foreground">View all products →</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container max-w-5xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {shop?.name}. Powered by Vestis</p>
        </div>
      </footer>
    </div>
  );
}
