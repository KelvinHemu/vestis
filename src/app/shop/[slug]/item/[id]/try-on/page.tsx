"use client";

/**
 * Virtual Try-On Studio — NOOON-inspired design
 *
 * A sleek, minimal page where users upload a full-body photo and see
 * themselves wearing the product via AI generation.
 *
 * STATES:
 *  1. Upload  — Drag & drop / click to choose a photo
 *  2. Loading — Uses the shared GeneratingShimmer component with a
 *               beautiful blur-wipe reveal animation
 *  3. Result  — Full-size try-on image with Save / Share / Buy actions
 *  4. Error   — Clean, minimal error display
 *
 * RESPONSIVE:
 *  - Desktop: Side-by-side layout (product left, studio right)
 *  - Mobile:  Stacked layout, full-width cards
 *
 * REUSES:
 *  - GeneratingShimmer — blurred shimmer loading + top-to-bottom reveal
 *  - Shimmer           — animated text shine effect
 *  - SHOP_CURSOR_STYLE — custom black dot cursor (NOOON-style)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  shopService,
  formatPrice,
  generateWhatsAppLink,
} from "@/services/shopService";
import { useAuthStore } from "@/contexts/authStore";
import { API_BASE_URL } from "@/config/api";
import { fetchWithAuth } from "@/utils/apiInterceptor";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Upload,
  X,
  Camera,
  Download,
  Share2,
  Clock,
  AlertCircle,
  Sparkles,
  RotateCcw,
  ShoppingBag,
  Image as ImageIcon,
  User,
  Zap,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Reusable shimmer components from our generation features
import { GeneratingShimmer } from "@/features/generation/components/GeneratingShimmer";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { SHOP_CURSOR_STYLE } from "@/components/shop/shopCursor";
import { CartDrawer } from "@/components/shop/CartDrawer";

// ============================================================================
// Types
// ============================================================================

/** Backend try-on result shape */
interface TryOnResult {
  id: number;
  image_url: string;
  expires_at: string;
  item: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };
}

/** Backend try-on error shape */
interface TryOnError {
  code: string;
  message: string;
  retry_after?: number;
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function TryOnStudioPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const itemId = parseInt(params.id as string);

  // ── Auth ──
  const { isAuthenticated } = useAuthStore();

  // ── Cart store ──
  const { addItem, openCart, getShopItemCount } = useCartStore();
  const cartCount = getShopItemCount(slug);

  // ── Try-on state machine ──
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const [tryOnError, setTryOnError] = useState<TryOnError | null>(null);
  const [step, setStep] = useState<"upload" | "loading" | "result" | "error">("upload");

  // ── Loading / shimmer state ──
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [revealComplete, setRevealComplete] = useState(false);
  const preGenerateUrlRef = useRef<string | null>(null);

  // ── UI state ──
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetching ──
  const { data: shop } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: () => shopService.getPublicShop(slug),
  });

  const { data: itemResponse, isLoading, error } = useQuery({
    queryKey: ["public-shop-item", slug, itemId],
    queryFn: () => shopService.getPublicShopItem(slug, itemId),
    enabled: !isNaN(itemId),
  });

  const item = itemResponse?.item;
  const images = item?.images || [];

  // ── Auth redirect on mount ──
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.setItem(
        "tryon_intent",
        JSON.stringify({ shopSlug: slug, itemId })
      );
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
    }
  }, [isAuthenticated, slug, itemId, router]);

  // ── File validation & selection ──
  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setTryOnError({
        code: "INVALID_PHOTO_TYPE",
        message: "Please upload a JPEG, PNG, or WebP image",
      });
      setStep("error");
      return;
    }

    // 10 MB max
    if (file.size > 10 * 1024 * 1024) {
      setTryOnError({
        code: "PHOTO_TOO_LARGE",
        message: "Photo must be under 10MB",
      });
      setStep("error");
      return;
    }

    setUserPhoto(file);
    setUserPhotoPreview(URL.createObjectURL(file));
    setTryOnError(null);
    setStep("upload");
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Drag & drop handlers ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Generate try-on via API ──
  const handleGenerate = async () => {
    if (!userPhoto) return;

    // Capture the user photo URL for the shimmer component preview
    preGenerateUrlRef.current = userPhotoPreview;
    setGeneratedImageUrl(null);
    setRevealComplete(false);
    setStep("loading");

    try {
      const formData = new FormData();
      formData.append("user_photo", userPhoto);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/v1/shop/${slug}/items/${itemId}/tryon`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = errorData.error || {};

        // Map HTTP status codes to user-friendly errors
        const errorMap: Record<number, TryOnError> = {
          401: { code: "AUTH_REQUIRED", message: "Please log in to try on items" },
          413: { code: "PHOTO_TOO_LARGE", message: "Photo must be under 10MB" },
          415: { code: "INVALID_PHOTO_TYPE", message: "Please upload a JPEG, PNG, or WebP image" },
          422: { code: "INVALID_PHOTO", message: err.message || "Could not process photo. Try a different image." },
          429: { code: "RATE_LIMIT_EXCEEDED", message: err.message || "You've hit the limit for today. Try again later.", retry_after: err.retry_after },
        };

        const mappedError = errorMap[response.status] || {
          code: err.code || "GENERATION_FAILED",
          message: err.message || "Could not generate. Please try again.",
        };

        // Special case: 403 may have specific codes
        if (response.status === 403) {
          mappedError.code = err.code || "SHOP_NO_CREDITS";
          mappedError.message = err.message || "Try-on is temporarily unavailable";
        }

        setTryOnError(mappedError);
        setStep("error");
        return;
      }

      const data = await response.json();
      setTryOnResult(data.tryon);

      // Feed the result image URL into GeneratingShimmer for the reveal animation
      setGeneratedImageUrl(data.tryon.image_url);

      toast.success("Your virtual try-on is ready!");
    } catch {
      setTryOnError({
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      });
      setStep("error");
    }
  };

  // ── When shimmer reveal finishes, show the result step ──
  const handleRevealComplete = useCallback(() => {
    setRevealComplete(true);
    setStep("result");
  }, []);

  // ── Download result image ──
  const handleDownload = async () => {
    if (!tryOnResult?.image_url) return;

    try {
      const response = await fetch(tryOnResult.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tryon-${item?.name?.replace(/\s+/g, "-") || "result"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Image saved!");
    } catch {
      toast.error("Failed to download image");
    }
  };

  // ── Share result image ──
  const handleShare = async () => {
    if (!tryOnResult?.image_url || !item) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out how I look in ${item.name}!`,
          url: tryOnResult.image_url,
        });
      } catch {
        await navigator.clipboard.writeText(tryOnResult.image_url);
        toast.success("Link copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(tryOnResult.image_url);
      toast.success("Link copied to clipboard!");
    }
  };

  // ── Full reset back to upload state ──
  const handleReset = () => {
    if (userPhotoPreview) URL.revokeObjectURL(userPhotoPreview);
    setUserPhoto(null);
    setUserPhotoPreview(null);
    setTryOnResult(null);
    setTryOnError(null);
    setGeneratedImageUrl(null);
    setRevealComplete(false);
    setStep("upload");
  };

  // ── Add to cart — direct from try-on page ──
  const handleAddToCart = () => {
    if (!item) return;

    addItem(item, slug);

    toast.success("Added to cart!", {
      description: `${item.name} has been added to your cart.`,
    });
  };

  // ── Expiry time helper ──
  const getExpiryHours = () => {
    if (!tryOnResult?.expires_at) return 0;
    const expiresAt = new Date(tryOnResult.expires_at);
    return Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)));
  };

  // ════════════════════════════════════════════════════════════════════════════
  // Loading / Error / Auth guard states
  // ════════════════════════════════════════════════════════════════════════════

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={SHOP_CURSOR_STYLE}>
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4" style={SHOP_CURSOR_STYLE}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-neutral-400" />
          </div>
          <h1 className="text-xl font-medium text-neutral-900 mb-2 tracking-tight">
            Item Not Found
          </h1>
          <p className="text-neutral-500 text-sm mb-8">
            The item you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button asChild variant="outline" className="rounded-none border-neutral-900 text-neutral-900 uppercase tracking-wider text-sm h-12 px-8">
            <Link href={`/shop/${slug}`}>Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={SHOP_CURSOR_STYLE}>
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Main Render
  // ════════════════════════════════════════════════════════════════════════════

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Beatrice Deck Trial', sans-serif", ...SHOP_CURSOR_STYLE }}
    >
      {/* ── Fullscreen Image Viewer ── */}
      <AnimatePresence>
        {isFullscreenOpen && tryOnResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-white flex items-center justify-center"
            style={{ cursor: "auto" }}
          >
            {/* Close */}
            <button
              onClick={() => setIsFullscreenOpen(false)}
              className="absolute top-6 right-6 z-10 p-3 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-neutral-800" />
            </button>

            {/* Centered result image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative w-[85vw] h-[85vh]"
            >
              <Image
                src={tryOnResult.image_url}
                alt={`You wearing ${item.name}`}
                fill
                sizes="85vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Minimal Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors -ml-1"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>

          {/* Center branding — clean, no icon */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-700">
              Fitting Room
            </span>
          </div>

          {/* Cart button — right aligned */}
          <button
            onClick={openCart}
            className="text-xs font-medium tracking-wide uppercase text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            CART {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

          {/* ────────────────────────────────────────────────────────────────
              UPLOAD STEP
          ──────────────────────────────────────────────────────────────── */}
          {step === "upload" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start"
            >
              {/* ── Left column: Product preview card ── */}
              <div className="order-2 lg:order-1">
                <div className="border border-neutral-200 bg-white">
                  {/* Product main image */}
                  <div className="relative aspect-[3/4] bg-neutral-50">
                    {images.length > 0 ? (
                      <Image
                        src={images[selectedImage]}
                        alt={item.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-neutral-200" />
                      </div>
                    )}
                  </div>

                  {/* Image thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-0 border-t border-neutral-200">
                      {images.slice(0, 5).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={cn(
                            "relative flex-1 aspect-square border-r border-neutral-200 last:border-r-0 transition-all overflow-hidden",
                            selectedImage === idx
                              ? "ring-2 ring-inset ring-neutral-900"
                              : "opacity-60 hover:opacity-100"
                          )}
                        >
                          <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product info bar */}
                  <div className="p-4 border-t border-neutral-200">
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 mb-1">
                      {shop?.name}
                    </p>
                    <div className="flex items-baseline justify-between">
                      <h2 className="text-base font-medium text-neutral-900 tracking-tight line-clamp-1">
                        {item.name}
                      </h2>
                      {item.price > 0 && (
                        <span className="text-base font-semibold text-neutral-900 ml-4 flex-shrink-0">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right column: Upload zone ── */}
              <div className="order-1 lg:order-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {!userPhotoPreview ? (
                  <div>
                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl font-light text-neutral-900 mb-3 tracking-tight">
                      Try it on
                    </h1>
                    <p className="text-neutral-500 text-base mb-10 max-w-md">
                      Upload a full-body photo to see how this piece looks on you.
                    </p>

                    {/* Drop zone — clean bordered rectangle */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative aspect-[3/4] max-w-sm border-2 transition-all duration-300 cursor-pointer group overflow-hidden",
                        isDragging
                          ? "border-neutral-900 bg-neutral-50"
                          : "border-dashed border-neutral-300 hover:border-neutral-400 bg-white"
                      )}
                    >
                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        {/* Avatar icon */}
                        <div
                          className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
                            isDragging
                              ? "bg-neutral-900 scale-110"
                              : "bg-neutral-100 group-hover:bg-neutral-200 group-hover:scale-105"
                          )}
                        >
                          {isDragging ? (
                            <Upload className="h-8 w-8 text-white" />
                          ) : (
                            <User className="h-8 w-8 text-neutral-400" />
                          )}
                        </div>

                        <p className="text-base font-medium text-neutral-800 mb-1">
                          {isDragging ? "Drop your photo" : "Upload your photo"}
                        </p>
                        <p className="text-sm text-neutral-400 mb-6">
                          Drag & drop or click to browse
                        </p>

                        {/* Choose Photo CTA */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none border-neutral-900 text-neutral-900 uppercase tracking-wider text-xs h-10 px-6 gap-2"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          Choose Photo
                        </Button>
                      </div>
                    </div>

                    {/* Pro tip */}
                    <div className="mt-6 flex items-start gap-3 text-xs text-neutral-400 max-w-sm">
                      <Zap className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <p>Best results with a full-body shot, facing camera, in good lighting.</p>
                    </div>
                  </div>
                ) : (
                  /* ── Photo selected — preview + generate ── */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl font-light text-neutral-900 mb-3 tracking-tight">
                      Ready to try on
                    </h1>
                    <p className="text-neutral-500 text-base mb-8">
                      Your photo is ready. Hit generate to see the magic.
                    </p>

                    {/* User photo preview */}
                    <div className="relative aspect-[3/4] max-w-sm overflow-hidden bg-neutral-50 border border-neutral-200">
                      <Image
                        src={userPhotoPreview}
                        alt="Your photo"
                        fill
                        sizes="(max-width: 640px) 100vw, 384px"
                        className="object-cover"
                      />

                      {/* Remove button — top right */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReset(); }}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-all"
                      >
                        <X className="h-4 w-4 text-neutral-700" />
                      </button>

                      {/* Change photo — bottom center */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm hover:bg-white transition-all text-sm text-neutral-700 flex items-center gap-2"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Change
                      </button>
                    </div>

                    {/* Generate button */}
                    <div className="max-w-sm mt-6">
                      <Button
                        onClick={handleGenerate}
                        className="w-full h-14 text-base font-bold uppercase tracking-wider rounded-none bg-neutral-900 hover:bg-neutral-800 text-white gap-3"
                      >
                        <Sparkles className="h-5 w-5" />
                        Generate Try-On
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────
              LOADING STEP — GeneratingShimmer + Shimmer text
          ──────────────────────────────────────────────────────────────── */}
          {step === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 sm:py-24"
            >
              {/* Shimmer "Creating your look" text */}
              <div className="mb-4">
                <Shimmer
                  className="text-base sm:text-lg font-medium text-neutral-400"
                  duration={2.5}
                  spread={2}
                >
                  Creating your look
                </Shimmer>
              </div>

              {/* GeneratingShimmer — blurred preview images + reveal animation */}
              <GeneratingShimmer
                images={[
                  ...(userPhotoPreview ? [userPhotoPreview] : []),
                  ...(images.length > 0 ? [images[0]] : []),
                ]}
                aspectRatio="3/4"
                className="relative rounded-none overflow-hidden mx-auto w-full max-w-[92%] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px]"
                generatedImageUrl={generatedImageUrl}
                onRevealComplete={handleRevealComplete}
              />

              {/* Subtle hint text */}
              <p className="text-xs text-neutral-300 mt-6 tracking-wide">
                Usually takes 20–60 seconds
              </p>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────
              RESULT STEP — Flat, minimal layout. Primary CTA right under image.
              Psychology: user sees the try-on → immediate impulse to buy.
          ──────────────────────────────────────────────────────────────── */}
          {step === "result" && tryOnResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* ── MOBILE LAYOUT (< lg) ── */}
              <div className="lg:hidden">
                {/* Try-on result image — full width, sharp edges */}
                <div
                  className="relative aspect-[3/4] w-full bg-neutral-50 border border-neutral-200 overflow-hidden cursor-pointer"
                  onClick={() => setIsFullscreenOpen(true)}
                >
                  <Image
                    src={tryOnResult.image_url}
                    alt={`You wearing ${item.name}`}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>

                {/* Expiry — tiny, just under image */}
                <p className="text-neutral-300 text-[10px] flex items-center gap-1 mt-2 px-1">
                  <Clock className="h-2.5 w-2.5" />
                  Available for {getExpiryHours()} hours
                </p>

                {/* ── Primary CTA: ADD TO CART — right under the image ── */}
                <div className="mt-4 space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-14 text-base font-bold uppercase tracking-wider rounded-none bg-neutral-900 hover:bg-neutral-800 text-white"
                  >
                    ADD TO CART
                  </Button>

                  {/* WhatsApp — secondary buy option */}
                  {shop?.whatsapp && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-12 rounded-none border-neutral-900 text-neutral-900 text-sm font-semibold uppercase tracking-wide gap-2"
                    >
                      <a
                        href={generateWhatsAppLink(
                          shop.whatsapp,
                          `Hi! I just tried on "${item.name}" virtually and I love it! I'd like to purchase it.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Buy via WhatsApp
                      </a>
                    </Button>
                  )}
                </div>

                {/* Product info — flat, no card wrapper */}
                <div className="mt-6 flex items-center gap-4">
                  {/* Small product thumbnail */}
                  {images.length > 0 && (
                    <div className="relative w-14 h-14 flex-shrink-0 bg-neutral-50 border border-neutral-200 overflow-hidden">
                      <Image
                        src={images[0]}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Name + price inline */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium uppercase tracking-wide text-neutral-900 truncate">
                      {item.name}
                    </p>
                    {item.price > 0 && (
                      <p className="text-sm text-neutral-500 mt-0.5">
                        {formatPrice(item.price, item.currency)}
                      </p>
                    )}
                  </div>
                </div>

                <Separator className="my-5 bg-neutral-100" />

                {/* Secondary actions — Save / Share / Try Again */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="flex-1 h-10 rounded-none gap-1.5 border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 uppercase tracking-wider text-[10px] font-semibold"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1 h-10 rounded-none gap-1.5 border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 uppercase tracking-wider text-[10px] font-semibold"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="h-10 px-4 rounded-none border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* View product details link */}
                <Link
                  href={`/shop/${slug}/item/${itemId}`}
                  className="block text-center mt-5 text-xs font-medium uppercase tracking-wider text-neutral-400 hover:text-neutral-900 transition-colors underline underline-offset-4"
                >
                  View Product Details
                </Link>
              </div>

              {/* ── DESKTOP LAYOUT (>= lg) ── */}
              <div className="hidden lg:grid lg:grid-cols-5 lg:gap-14 items-start">
                {/* Left: Result image + expiry + save/share */}
                <div className="lg:col-span-3">
                  {/* Try-on result image — sharp-edged, no rounded corners */}
                  <div
                    className="relative aspect-[3/4] max-w-lg bg-neutral-50 border border-neutral-200 overflow-hidden cursor-pointer group"
                    onClick={() => setIsFullscreenOpen(true)}
                  >
                    <Image
                      src={tryOnResult.image_url}
                      alt={`You wearing ${item.name}`}
                      fill
                      sizes="512px"
                      className="object-cover"
                    />

                    {/* Hover zoom hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-white/80 backdrop-blur-sm">
                        <span className="text-xs font-medium uppercase tracking-wider text-neutral-700">
                          View Full Size
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expiry note */}
                  <p className="text-neutral-300 text-xs flex items-center gap-1.5 mt-3">
                    <Clock className="h-3 w-3" />
                    Available for {getExpiryHours()} hours
                  </p>

                  {/* Save / Share / Try Again row */}
                  <div className="max-w-lg flex gap-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1 h-11 rounded-none gap-2 border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 uppercase tracking-wider text-xs font-semibold"
                    >
                      <Download className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="flex-1 h-11 rounded-none gap-2 border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 uppercase tracking-wider text-xs font-semibold"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="h-11 px-5 rounded-none border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Right: Product info + purchase actions — flat, no nested card */}
                <div className="lg:col-span-2 lg:sticky lg:top-20">
                  {/* Small product thumbnail */}
                  {images.length > 0 && (
                    <div className="relative aspect-square w-24 bg-neutral-50 border border-neutral-200 overflow-hidden mb-5">
                      <Image
                        src={images[0]}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                  )}

                  {/* Shop name */}
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 mb-1">
                    {shop?.name}
                  </p>

                  {/* Product name */}
                  <h2 className="text-xl font-medium text-neutral-900 tracking-tight mb-1">
                    {item.name}
                  </h2>

                  {/* Price */}
                  {item.price > 0 && (
                    <p className="text-lg font-semibold text-neutral-900 mb-6">
                      {formatPrice(item.price, item.currency)}
                    </p>
                  )}

                  <Separator className="bg-neutral-100 mb-6" />

                  {/* ADD TO CART — primary action */}
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-14 text-base font-bold uppercase tracking-wider rounded-none bg-neutral-900 hover:bg-neutral-800 text-white"
                  >
                    ADD TO CART
                  </Button>

                  {/* WhatsApp — secondary buy */}
                  {shop?.whatsapp && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full h-12 mt-3 rounded-none border-neutral-900 text-neutral-900 text-sm font-semibold uppercase tracking-wide gap-2"
                    >
                      <a
                        href={generateWhatsAppLink(
                          shop.whatsapp,
                          `Hi! I just tried on "${item.name}" virtually and I love it! I'd like to purchase it.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Buy via WhatsApp
                      </a>
                    </Button>
                  )}

                  {/* View product details */}
                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 mt-3 rounded-none border-neutral-200 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900 uppercase tracking-wider text-xs font-semibold"
                  >
                    <Link href={`/shop/${slug}/item/${itemId}`}>
                      View Product Details
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ────────────────────────────────────────────────────────────────
              ERROR STEP
          ──────────────────────────────────────────────────────────────── */}
          {step === "error" && tryOnError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              {/* Error icon */}
              <div className="w-20 h-20 mb-8 flex items-center justify-center border border-neutral-200">
                {tryOnError.code === "RATE_LIMIT_EXCEEDED" ? (
                  <Clock className="h-8 w-8 text-neutral-400" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-neutral-400" />
                )}
              </div>

              {/* Error title */}
              <h2 className="text-2xl sm:text-3xl font-light text-neutral-900 tracking-tight mb-3">
                {tryOnError.code === "RATE_LIMIT_EXCEEDED"
                  ? "Limit Reached"
                  : tryOnError.code === "AUTH_REQUIRED"
                  ? "Login Required"
                  : "Something Went Wrong"}
              </h2>

              {/* Error message */}
              <p className="text-neutral-500 mb-10 max-w-sm text-sm">
                {tryOnError.message}
              </p>

              {/* Action buttons */}
              {tryOnError.code === "AUTH_REQUIRED" ? (
                <Button
                  onClick={() => {
                    sessionStorage.setItem(
                      "tryon_intent",
                      JSON.stringify({ shopSlug: slug, itemId })
                    );
                    router.push(
                      `/login?redirect=${encodeURIComponent(window.location.pathname)}`
                    );
                  }}
                  className="rounded-none bg-neutral-900 hover:bg-neutral-800 text-white uppercase tracking-wider h-12 px-8 text-sm font-semibold"
                >
                  Log In
                </Button>
              ) : tryOnError.code !== "RATE_LIMIT_EXCEEDED" &&
                tryOnError.code !== "SHOP_NO_CREDITS" ? (
                <Button
                  onClick={handleReset}
                  className="rounded-none bg-neutral-900 hover:bg-neutral-800 text-white uppercase tracking-wider h-12 px-8 text-sm font-semibold gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              ) : null}
            </motion.div>
          )}
        </div>
      </main>

      {/* ── Footer — subtle security note ── */}
      <div className="border-t border-neutral-100 py-6 text-center">
        <p className="text-[11px] text-neutral-300 uppercase tracking-[0.15em]">
          Your photo is processed securely and automatically deleted after 48 hours
        </p>
      </div>

      {/* ── Cart Drawer — slides in from right when items are added ── */}
      <CartDrawer shopSlug={slug} shop={shop} />
    </div>
  );
}
