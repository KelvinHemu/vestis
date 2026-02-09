"use client";

/**
 * Public Item Page - NOOON-inspired product detail page
 * 
 * DESKTOP LAYOUT:
 * - Left panel (~35%): Product name, price, size/color selectors,
 *   Add to Cart, collapsible Description, Virtual Try On
 * - Right panel (~65%): Auto-scrolling image carousel that moves
 *   right-to-left continuously. Pauses on hover.
 *
 * MOBILE LAYOUT:
 * - Top: Swipeable image carousel with dot indicators
 * - Below: Product name + price side by side
 * - Size/color selectors
 * - Add to Cart full-width button
 * - Try On and WhatsApp buttons
 *
 * LIGHTBOX:
 * - Fullscreen white overlay
 * - Large centered image
 * - X close, left/right arrow navigation
 *
 * CURSOR:
 * - Custom black dot cursor across all shop pages (like NOOON)
 *
 * BOTTOM:
 * - "OTHER PRODUCTS" section with 4-col grid
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  shopService, 
  formatPrice, 
  generateWhatsAppLink, 
} from "@/services/shopService";
import { useCartStore } from "@/stores/cartStore";
import { 
  Loader2, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus,
  Sparkles,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ShopFooter } from "@/components/shop/ShopFooter";
import { ProductCard } from "@/components/shop/ProductCard";
import { SHOP_CURSOR_STYLE } from "@/components/shop/shopCursor";
import { motion, AnimatePresence } from "motion/react";

// ============================================================================
// Color Utilities
// ============================================================================

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
};

/** Resolve a named color to its hex code */
const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return colorToHex[normalized] || "#9CA3AF";
};

// ============================================================================
// Auto-Scrolling Image Carousel (Desktop)
// ============================================================================

interface DesktopCarouselProps {
  images: string[];
  productName: string;
  onImageClick: (index: number) => void;
}

/**
 * Horizontal strip of large images that auto-scrolls right-to-left.
 * Images are duplicated for seamless infinite looping.
 * Pauses on hover so the user can inspect / click.
 * Uses a ref for pause state to avoid re-creating the animation loop.
 */
function DesktopCarousel({ images, productName, onImageClick }: DesktopCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // Using a ref for pause state so the animation callback never
  // gets recreated — the RAF loop runs forever, just skips frames when paused
  const isPausedRef = useRef(false);
  const speedRef = useRef(0.7); // pixels per frame — smooth, steady pace

  // Single animation loop that runs from mount to unmount
  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (el && !isPausedRef.current) {
      el.scrollLeft += speedRef.current;

      // Seamless loop: when past the first duplicate set, snap back
      const halfScroll = el.scrollWidth / 2;
      if (el.scrollLeft >= halfScroll) {
        el.scrollLeft -= halfScroll;
      }
    }
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Start the loop once on mount, clean up on unmount
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  // Single static image — no carousel needed
  if (images.length <= 1) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        {images[0] ? (
          <div 
            className="relative w-full h-full"
            onClick={() => onImageClick(0)}
          >
            <Image
              src={images[0]}
              alt={productName}
              fill
              sizes="65vw"
              className="object-contain"
              priority
            />
            {/* Subtle zoom hint */}
            <div className="absolute top-5 left-5 p-2.5 rounded-full bg-white/70 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
              <Search className="h-4 w-4 text-neutral-500" />
            </div>
          </div>
        ) : (
          <span className="text-8xl text-neutral-200">👔</span>
        )}
      </div>
    );
  }

  // Duplicate images array for the infinite loop illusion
  const loopedImages = [...images, ...images];

  return (
    <div
      ref={scrollRef}
      className="h-full flex overflow-x-hidden"
      onMouseEnter={() => { isPausedRef.current = true; }}
      onMouseLeave={() => { isPausedRef.current = false; }}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {loopedImages.map((img, idx) => {
        const realIndex = idx % images.length;
        return (
          <div
            key={`carousel-${idx}`}
            className="relative flex-shrink-0 h-full"
            style={{ width: "auto", minWidth: "40%" }}
            onClick={() => onImageClick(realIndex)}
          >
            <div className="relative h-full" style={{ aspectRatio: "3/4" }}>
              <Image
                src={img}
                alt={`${productName} ${realIndex + 1}`}
                fill
                sizes="40vw"
                className="object-contain"
                priority={idx < images.length}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Mobile Swipeable Carousel
// ============================================================================

interface MobileCarouselProps {
  images: string[];
  productName: string;
  onImageClick: (index: number) => void;
}

/**
 * Touch-swipeable image carousel for mobile.
 * Shows dot indicators below. Tap opens lightbox.
 */
function MobileCarousel({ images, productName, onImageClick }: MobileCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Minimum swipe distance to trigger slide (px)
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0 && current < images.length - 1) {
        setCurrent((prev) => prev + 1);
      } else if (diff < 0 && current > 0) {
        setCurrent((prev) => prev - 1);
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-neutral-50 flex items-center justify-center">
        <span className="text-8xl text-neutral-200">👔</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Image viewport */}
      <div
        className="relative aspect-square bg-white overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => onImageClick(current)}
      >
        {/* Sliding image strip */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative w-full h-full flex-shrink-0">
              <Image
                src={img}
                alt={`${productName} ${idx + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "rounded-full transition-all duration-300",
                idx === current
                  ? "w-2.5 h-2.5 bg-neutral-900"
                  : "w-1.5 h-1.5 bg-neutral-300"
              )}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Fullscreen Image Lightbox
// ============================================================================

interface LightboxProps {
  images: string[];
  currentIndex: number;
  productName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Full-viewport lightbox overlay.
 * White background, centered image, X to close,
 * left/right chevron arrows for navigation.
 */
function ImageLightbox({ images, currentIndex, productName, onClose, onNavigate }: LightboxProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, images.length, onClose, onNavigate]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
        style={{ cursor: "auto" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-3 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-neutral-800" />
        </button>

        {/* Left arrow */}
        {currentIndex > 0 && (
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-7 w-7 text-neutral-600" />
          </button>
        )}

        {/* Right arrow */}
        {currentIndex < images.length - 1 && (
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-7 w-7 text-neutral-600" />
          </button>
        )}

        {/* Main image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-[85vw] h-[85vh]"
        >
          <Image
            src={images[currentIndex]}
            alt={`${productName} ${currentIndex + 1}`}
            fill
            sizes="85vw"
            className="object-contain"
            priority
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================================
// Collapsible Section Component
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Accordion-style collapsible. Bold uppercase title, bottom border,
 * +/– toggle icon. Matches the NOOON accordion pattern exactly.
 */
function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="text-sm font-bold tracking-wide uppercase text-neutral-900">
          {title}
        </span>
        <span className="text-neutral-400 group-hover:text-neutral-600 transition-colors">
          {isOpen ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </span>
      </button>

      {/* Animated content reveal */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-neutral-600 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Color Swatch — Rectangle style (not circle)
// ============================================================================

interface ColorSwatchProps {
  color: string;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Rectangle color swatch with the color name label.
 * Selected state: dark border + checkmark-style highlight.
 * Much cleaner than circles for a fashion-forward look.
 */
function ColorSwatch({ color, isSelected, onClick }: ColorSwatchProps) {
  const hex = getColorHex(color);
  const isLight = ["white", "cream", "beige", "ivory", "yellow", "mint", "lavender", "tan", "khaki", "gold", "silver"]
    .includes(color.toLowerCase().trim());

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 border transition-all text-left",
        isSelected
          ? "border-neutral-900 bg-neutral-50"
          : "border-neutral-200 hover:border-neutral-400"
      )}
    >
      {/* Color rectangle swatch */}
      <div
        className={cn(
          "w-5 h-5 flex-shrink-0",
          isLight && "border border-neutral-200"
        )}
        style={{ backgroundColor: hex }}
      />
      {/* Color name */}
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-700">
        {color}
      </span>
    </button>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function PublicItemPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const itemId = parseInt(params.id as string);

  // Local state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Cart store
  const { addItem, openCart, getShopItemCount } = useCartStore();
  const cartCount = getShopItemCount(slug);

  // -------------------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------------------

  const { data: shop } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: () => shopService.getPublicShop(slug),
  });

  const { data: itemResponse, isLoading, error } = useQuery({
    queryKey: ["public-shop-item", slug, itemId],
    queryFn: () => shopService.getPublicShopItem(slug, itemId),
    enabled: !isNaN(itemId),
  });

  // All items for "Other Products" section
  const { data: allItemsResponse } = useQuery({
    queryKey: ["public-shop-items", slug],
    queryFn: () => shopService.getPublicShopItems(slug, { available_only: false }),
    enabled: !!shop,
  });

  const item = itemResponse?.item;
  const images = item?.images || [];

  // Show up to 4 other products (excluding this one)
  const otherProducts = (allItemsResponse?.items || []).filter(
    (p) => p.id !== itemId
  ).slice(0, 4);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  /** Open fullscreen lightbox at clicked image */
  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  /** Add item to cart with validations */
  const handleAddToCart = () => {
    if (!item) return;

    if (item.sizes && item.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (item.colors && item.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    addItem(item, slug, { 
      size: selectedSize || undefined, 
      color: selectedColor || undefined 
    });
    
    toast.success("Added to cart!", {
      description: `${item.name} has been added to your cart.`,
    });
  };

  /** Navigate to virtual try-on studio */
  const handleTryOnClick = () => {
    router.push(`/shop/${slug}/item/${itemId}/try-on`);
  };

  /** Build WhatsApp inquiry message */
  const buildInquiryMessage = () => {
    let msg = `Hi! I'm interested in "${item?.name}"`;
    if (item && item.price > 0) {
      msg += ` (${formatPrice(item.price, item.currency)})`;
    }
    if (selectedSize) msg += ` - Size: ${selectedSize}`;
    if (selectedColor) msg += ` - Color: ${selectedColor}`;
    msg += `\n\nItem link: ${typeof window !== 'undefined' ? window.location.href : ''}`;
    return msg;
  };

  // -------------------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Error State
  // -------------------------------------------------------------------------

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
        <h1 className="text-lg font-medium tracking-wide uppercase mb-2">
          Item Not Found
        </h1>
        <p className="text-sm text-neutral-500 text-center mb-6">
          The item you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link 
          href={`/shop/${slug}`}
          className="text-sm font-medium uppercase tracking-wide text-neutral-900 underline"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div 
      className="min-h-screen bg-white flex flex-col" 
      style={{ 
        fontFamily: "'Beatrice Deck Trial', sans-serif",
        ...SHOP_CURSOR_STYLE,
      }}
    >
      {/* ================================================================== */}
      {/* HEADER                                                              */}
      {/* ================================================================== */}
      <header className="w-full bg-white py-5 md:py-6 border-b border-neutral-100">
        <div className="max-w-[1800px] mx-auto px-4 md:px-8">
          <div className="relative flex items-center justify-center">
            {/* Center — Brand name */}
            <Link 
              href={`/shop/${slug}`}
              className="text-center group"
            >
              <h1 className="text-base md:text-lg font-bold tracking-[0.2em] uppercase text-neutral-900">
                {shop?.name || "SHOP"}
              </h1>
              {(shop?.tagline || shop?.bio) && (
                <p className="mt-0.5 text-[9px] tracking-[0.3em] text-neutral-400 uppercase font-medium">
                  {shop?.tagline || shop?.bio}
                </p>
              )}
            </Link>

            {/* Right — Cart */}
            <button
              onClick={openCart}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-medium tracking-wide uppercase text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              CART {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN CONTENT                                                        */}
      {/* ================================================================== */}
      <main className="flex-1">

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (< lg)                                            */}
        {/* ============================================================== */}
        <div className="lg:hidden">
          {/* Swipeable image carousel */}
          <MobileCarousel
            images={images}
            productName={item.name}
            onImageClick={handleImageClick}
          />

          {/* Product info */}
          <div className="px-4 pt-4 pb-8">
            {/* Name + Price row */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-base font-bold tracking-wide uppercase text-neutral-900 leading-tight flex-1">
                {item.name}
              </h2>
              {item.price > 0 && (
                <p className="text-base font-medium text-neutral-900 whitespace-nowrap">
                  {formatPrice(item.price, item.currency)}
                </p>
              )}
            </div>

            {/* Unavailable badge */}
            {!item.is_available && (
              <div className="mt-3">
                <Badge variant="secondary" className="rounded-none text-xs uppercase tracking-wide font-medium">
                  Currently Unavailable
                </Badge>
              </div>
            )}

            {/* Colors — rectangle swatches */}
            {item.colors && item.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-3">
                  Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.colors.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      isSelected={selectedColor === color}
                      onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes — inline selector */}
            {item.sizes && item.sizes.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-3">
                  Select a Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={cn(
                        "min-w-[44px] h-11 px-4 border text-sm font-medium uppercase transition-all",
                        selectedSize === size 
                          ? "bg-neutral-900 text-white border-neutral-900" 
                          : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            {item.is_available && (
              <div className="mt-8 space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-13 rounded-none bg-neutral-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-neutral-800"
                >
                  ADD TO CART
                </Button>

                <Button
                  onClick={handleTryOnClick}
                  variant="outline"
                  className="w-full h-12 rounded-none border-neutral-900 text-neutral-900 text-sm font-semibold uppercase tracking-wide hover:bg-neutral-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Virtual Try On
                </Button>

                {shop?.whatsapp && (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-12 rounded-none border-neutral-200 text-neutral-600 text-sm font-semibold uppercase tracking-wide hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <a
                      href={generateWhatsAppLink(shop.whatsapp, buildInquiryMessage())}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy via WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Description accordion */}
            {item.description && (
              <div className="mt-6">
                <CollapsibleSection title="Description">
                  {item.description}
                </CollapsibleSection>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP LAYOUT (>= lg)                                          */}
        {/* Left: product info panel  |  Right: auto-scroll carousel        */}
        {/* ============================================================== */}
        <div className="hidden lg:flex min-h-[calc(100vh-80px)]">
          
          {/* ------------------------------------------------------------ */}
          {/* LEFT PANEL — Product Info                                      */}
          {/* ------------------------------------------------------------ */}
          <div className="w-[35%] max-w-[460px] flex-shrink-0 flex flex-col">
            {/* Scrollable info region */}
            <div className="flex-1 overflow-y-auto p-8 xl:p-12">
              
              {/* Product Name — large, bold, uppercase like NOOON */}
              <h2 className="text-xl xl:text-2xl font-bold tracking-wide uppercase text-neutral-900 leading-tight">
                {item.name}
              </h2>

              {/* Price + inline size selector row */}
              <div className="mt-5 flex items-center flex-wrap gap-4">
                {item.price > 0 && (
                  <span className="text-lg xl:text-xl font-semibold text-neutral-900">
                    {formatPrice(item.price, item.currency)}
                  </span>
                )}

                {/* Size pills inline with price (NOOON style) */}
                {item.sizes && item.sizes.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {item.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                        className={cn(
                          "min-w-[40px] h-10 px-3 border text-sm font-medium uppercase transition-all",
                          selectedSize === size
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-900"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors — rectangle swatches with label */}
              {item.colors && item.colors.length > 0 && (
                <div className="mt-7">
                  <p className="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-3">
                    Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.colors.map((color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        isSelected={selectedColor === color}
                        onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unavailable badge */}
              {!item.is_available && (
                <div className="mt-5">
                  <Badge variant="secondary" className="rounded-none text-xs uppercase tracking-wide font-medium">
                    Currently Unavailable
                  </Badge>
                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* Action Buttons                                             */}
              {/* -------------------------------------------------------- */}
              {item.is_available && (
                <div className="mt-8 space-y-3">
                  {/* Add to Cart — primary, bold, full-width black */}
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-13 rounded-none bg-neutral-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-neutral-800"
                  >
                    ADD TO CART
                  </Button>

                  {/* Virtual Try On — outlined, with sparkles icon */}
                  <Button
                    onClick={handleTryOnClick}
                    variant="outline"
                    className="w-full h-12 rounded-none border-neutral-900 text-neutral-900 text-sm font-semibold uppercase tracking-wide hover:bg-neutral-50"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Virtual Try On
                  </Button>

                  {/* WhatsApp — subtle border */}
                  {shop?.whatsapp && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-12 rounded-none border-neutral-200 text-neutral-600 text-sm font-semibold uppercase tracking-wide hover:border-neutral-900 hover:text-neutral-900"
                    >
                      <a
                        href={generateWhatsAppLink(shop.whatsapp, buildInquiryMessage())}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buy via WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {/* Separator before accordion sections */}
              <Separator className="mt-8 mb-0" />

              {/* Collapsible sections */}
              {item.description && (
                <CollapsibleSection title="Description">
                  {item.description}
                </CollapsibleSection>
              )}


            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT PANEL — Auto-scrolling Image Carousel                    */}
          {/* ------------------------------------------------------------ */}
          <div className="flex-1 border-l border-neutral-100 overflow-hidden">
            <DesktopCarousel
              images={images}
              productName={item.name}
              onImageClick={handleImageClick}
            />
          </div>
        </div>
      </main>

      {/* ================================================================== */}
      {/* OTHER PRODUCTS                                                      */}
      {/* ================================================================== */}
      {otherProducts.length > 0 && (
        <section className="border-t border-neutral-100 bg-white">
          <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-12 md:py-16">
            <h3 className="text-base md:text-lg font-bold tracking-wide uppercase text-neutral-900 mb-8 md:mb-12">
              Other Products
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-2 gap-y-8 md:gap-x-4 md:gap-y-10">
              {otherProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  item={product} 
                  shopSlug={slug} 
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* FOOTER                                                              */}
      {/* ================================================================== */}
      <ShopFooter 
        shopName={shop?.name || "Shop"} 
        shopSlug={slug} 
      />

      {/* Cart Drawer */}
      <CartDrawer shopSlug={slug} shop={shop} />

      {/* Fullscreen Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          productName={item.name}
          onClose={() => setLightboxOpen(false)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
}
