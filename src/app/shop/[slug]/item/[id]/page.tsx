"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService, formatPrice, generateWhatsAppLink, generateEmailLink } from "@/services/shopService";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Share2, Check, Sparkles, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Color name to hex mapping for common colors
const colorToHex: Record<string, string> = {
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  purple: "#A855F7",
  pink: "#EC4899",
  orange: "#F97316",
  black: "#1F2937",
  white: "#FFFFFF",
  gray: "#9CA3AF",
  grey: "#9CA3AF",
  navy: "#1E3A5A",
  brown: "#92400E",
  beige: "#D4C4A8",
  cream: "#FFFDD0",
  mint: "#98FF98",
  teal: "#14B8A6",
  coral: "#FF7F7F",
  lavender: "#C4B5FD",
  maroon: "#7F1D1D",
  olive: "#84CC16",
  tan: "#D2B48C",
  turquoise: "#40E0D0",
  gold: "#FFD700",
  silver: "#C0C0C0",
  cyan: "#06B6D4",
  magenta: "#D946EF",
  indigo: "#6366F1",
  violet: "#8B5CF6",
  charcoal: "#374151",
  burgundy: "#800020",
  khaki: "#C3B091",
  // Add more as needed
};

const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return colorToHex[normalized] || "#9CA3AF"; // Default to gray if not found
};

export default function PublicItemPage() {
  const params = useParams();
  const router = useRouter();
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
  const images = item?.images || [];
  const hasMultipleImages = images.length > 1;

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

  // Handle try-on button click - Navigate to dedicated try-on page
  const handleTryOnClick = () => {
    router.push(`/shop/${slug}/item/${itemId}/try-on`);
  };

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/shop/${slug}`} className="gap-2 text-gray-900 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" />
              Back to {shop?.name || "Vestis"}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-gray-600 hover:text-gray-900"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start justify-center">
          {/* Left: Main Image */}
          <div className="relative w-full lg:w-[480px] aspect-[3/4] bg-gray-50 overflow-hidden flex-shrink-0">
            {images.length > 0 ? (
              <Image
                src={images[currentImageIndex]}
                alt={item.name}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl text-gray-300">👔</span>
              </div>
            )}
          </div>

          {/* Center: Vertical Thumbnails */}
          {hasMultipleImages && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] pb-2 lg:pb-0 flex-shrink-0 order-3 lg:order-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "relative w-[60px] h-[75px] flex-shrink-0 overflow-hidden border-2 transition-all bg-gray-50",
                    idx === currentImageIndex 
                      ? "border-gray-900" 
                      : "border-gray-200 hover:border-gray-400"
                  )}
                >
                  <Image src={img} alt={`${item.name} ${idx + 1}`} fill sizes="60px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Right: Product Details */}
          <div className="w-full lg:w-[320px] flex-shrink-0 order-2 lg:order-3">
            {/* Refresh Icon */}
            <div className="flex justify-end mb-6">
              <button 
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <RotateCcw className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Title & Price */}
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-wide uppercase text-gray-900">
                {item.name}
              </h1>
              {item.price > 0 && (
                <p className="text-xl font-semibold mt-2 text-gray-900">
                  {formatPrice(item.price, item.currency)}
                </p>
              )}
              <p className="text-sm text-gray-400 mt-1">MRP incl. of all taxes</p>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-base font-medium text-gray-900 mb-8 leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Availability */}
            {!item.is_available && (
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  Currently Unavailable
                </span>
              </div>
            )}

            {/* Colors */}
            {item.colors && item.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm text-gray-500 mb-3 tracking-wide">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {item.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                      className={cn(
                        "w-11 h-11 transition-all",
                        selectedColor === color 
                          ? "ring-2 ring-gray-900 ring-offset-2" 
                          : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
                      )}
                      style={{ backgroundColor: getColorHex(color) }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm text-gray-500 mb-3 tracking-wide">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={cn(
                        "min-w-[44px] h-11 px-4 border text-sm font-medium transition-all",
                        selectedSize === size 
                          ? "bg-gray-900 text-white border-gray-900" 
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-4 text-xs text-gray-400 tracking-wide">
                  <button className="hover:text-gray-700 hover:underline uppercase">Find Your Size</button>
                  <span>|</span>
                  <button className="hover:text-gray-700 hover:underline uppercase">Measurement Guide</button>
                </div>
              </div>
            )}

            {/* Buy and Try On Buttons - Outside the card */}
            {item.is_available && (
              <div className="flex gap-3 pt-4">
                {/* Buy Button */}
                <Button
                  asChild
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white h-12 text-sm font-semibold rounded-none"
                  size="lg"
                >
                  <a
                    href={shop?.whatsapp 
                      ? generateWhatsAppLink(shop.whatsapp, buildInquiryMessage())
                      : shop?.email 
                        ? generateEmailLink(shop.email, `I want to buy: ${item.name}`, buildInquiryMessage())
                        : "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!shop?.whatsapp && !shop?.email) {
                        e.preventDefault();
                        toast.info("Contact seller for purchase", {
                          description: "Please reach out to the shop for buying information."
                        });
                      }
                    }}
                  >
                    Buy
                  </a>
                </Button>

                {/* Try On Button */}
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-sm font-semibold border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-none"
                  size="lg"
                  onClick={handleTryOnClick}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try On
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {shop?.name}. Powered by Vestis</p>
        </div>
      </footer>
    </div>
  );
}
