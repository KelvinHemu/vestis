"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { shopService, formatPrice, generateWhatsAppLink } from "@/services/shopService";
import { useAuthStore } from "@/contexts/authStore";
import { API_BASE_URL } from "@/config/api";
import { fetchWithAuth } from "@/utils/apiInterceptor";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Try-on result type from backend
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

interface TryOnError {
  code: string;
  message: string;
  retry_after?: number;
}

export default function TryOnStudioPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const itemId = parseInt(params.id as string);

  // Auth state
  const { isAuthenticated, token } = useAuthStore();

  // Try On states
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<TryOnResult | null>(null);
  const [tryOnError, setTryOnError] = useState<TryOnError | null>(null);
  const [step, setStep] = useState<"upload" | "loading" | "result" | "error">("upload");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch shop
  const { data: shop } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: () => shopService.getPublicShop(slug),
  });

  // Fetch item
  const { data: itemResponse, isLoading, error } = useQuery({
    queryKey: ["public-shop-item", slug, itemId],
    queryFn: () => shopService.getPublicShopItem(slug, itemId),
    enabled: !isNaN(itemId),
  });

  const item = itemResponse?.item;
  const images = item?.images || [];

  // Loading messages for try-on generation
  const loadingMessages = [
    "Analyzing your photo...",
    "Understanding body proportions...",
    "Fitting the garment perfectly...",
    "Adjusting lighting and shadows...",
    "Adding final touches...",
  ];

  // Update loading message based on elapsed time
  useEffect(() => {
    if (step !== "loading") {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step === "loading") {
      const messageIndex = Math.min(
        Math.floor(elapsedTime / 3),
        loadingMessages.length - 1
      );
      setLoadingMessage(loadingMessages[messageIndex]);
    }
  }, [elapsedTime, step, loadingMessages]);

  // Check authentication on page load
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

  // Handle file selection
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

  // Drag and drop handlers
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

  // Generate Try On
  const handleGenerate = async () => {
    if (!userPhoto) return;

    setStep("loading");
    setElapsedTime(0);

    try {
      const formData = new FormData();
      formData.append("user_photo", userPhoto);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/v1/shop/${slug}/items/${itemId}/tryon`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = errorData.error || {};

        switch (response.status) {
          case 401:
            setTryOnError({
              code: "AUTH_REQUIRED",
              message: "Please log in to try on items",
            });
            break;
          case 403:
            setTryOnError({
              code: error.code || "SHOP_NO_CREDITS",
              message: error.message || "Try-on is temporarily unavailable",
            });
            break;
          case 413:
            setTryOnError({
              code: "PHOTO_TOO_LARGE",
              message: "Photo must be under 10MB",
            });
            break;
          case 415:
            setTryOnError({
              code: "INVALID_PHOTO_TYPE",
              message: "Please upload a JPEG, PNG, or WebP image",
            });
            break;
          case 422:
            setTryOnError({
              code: "INVALID_PHOTO",
              message:
                error.message || "Could not process photo. Try a different image.",
            });
            break;
          case 429:
            setTryOnError({
              code: "RATE_LIMIT_EXCEEDED",
              message:
                error.message ||
                "You have reached the maximum try-ons for this item today.",
              retry_after: error.retry_after,
            });
            break;
          default:
            setTryOnError({
              code: error.code || "GENERATION_FAILED",
              message: error.message || "Could not generate. Please try again.",
            });
        }
        setStep("error");
        return;
      }

      const data = await response.json();
      setTryOnResult(data.tryon);
      setStep("result");
      toast.success("Your virtual try-on is ready!");
    } catch (err) {
      setTryOnError({
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      });
      setStep("error");
    }
  };

  // Download image
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
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  // Share image
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

  // Reset
  const handleReset = () => {
    if (userPhotoPreview) {
      URL.revokeObjectURL(userPhotoPreview);
    }
    setUserPhoto(null);
    setUserPhotoPreview(null);
    setTryOnResult(null);
    setTryOnError(null);
    setStep("upload");
    setElapsedTime(0);
  };

  // Get expiry hours
  const getExpiryHours = () => {
    if (!tryOnResult?.expires_at) return 0;
    const expiresAt = new Date(tryOnResult.expires_at);
    return Math.max(
      0,
      Math.round((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60))
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !item) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-medium text-neutral-900 mb-2">
            Item Not Found
          </h1>
          <p className="text-neutral-500 mb-6">
            The item you're looking for doesn't exist.
          </p>
          <Button asChild variant="outline">
            <Link href={`/shop/${slug}`}>Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-neutral-600 hover:text-neutral-900 gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">
              Virtual Fitting Room
            </span>
          </div>

          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-5xl">
            {/* Upload Step */}
            {step === "upload" && (
              <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-center">
                {/* Left - Product Preview */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-4">
                      {images.length > 0 ? (
                        <Image
                          src={images[selectedImage]}
                          alt={item.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-neutral-300" />
                        </div>
                      )}
                    </div>

                    {/* Image Thumbnails */}
                    {images.length > 1 && (
                      <div className="flex gap-2 mb-4">
                        {images.slice(0, 4).map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={cn(
                              "relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                              selectedImage === idx
                                ? "border-neutral-900"
                                : "border-transparent opacity-60 hover:opacity-100"
                            )}
                          >
                            <Image src={img} alt="" fill sizes="56px" className="object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Product Info */}
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                        {shop?.name}
                      </p>
                      <h2 className="text-lg font-medium text-neutral-900 mb-1 line-clamp-1">
                        {item.name}
                      </h2>
                      {item.price > 0 && (
                        <p className="text-xl font-semibold text-neutral-900">
                          {formatPrice(item.price, item.currency)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right - Upload Zone */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {!userPhotoPreview ? (
                    <div className="text-center lg:text-left">
                      <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 mb-3">
                        Try it on
                      </h1>
                      <p className="text-neutral-500 mb-8 max-w-md">
                        Upload a full-body photo to see how this piece looks on you
                      </p>

                      {/* Upload Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group overflow-hidden",
                          isDragging
                            ? "border-neutral-900 bg-neutral-100"
                            : "border-neutral-300 hover:border-neutral-400 bg-white"
                        )}
                      >
                        {/* Subtle grid pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }} />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                          <div className={cn(
                            "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
                            isDragging 
                              ? "bg-neutral-900 scale-110" 
                              : "bg-neutral-100 group-hover:bg-neutral-200 group-hover:scale-105"
                          )}>
                            {isDragging ? (
                              <Upload className="h-8 w-8 text-white" />
                            ) : (
                              <User className="h-8 w-8 text-neutral-400" />
                            )}
                          </div>
                          
                          <p className="text-lg font-medium text-neutral-800 mb-2">
                            {isDragging ? "Drop your photo" : "Upload your photo"}
                          </p>
                          <p className="text-sm text-neutral-500 text-center mb-6">
                            Drag & drop or click to browse
                          </p>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2 rounded-full border-neutral-300"
                          >
                            <Camera className="h-4 w-4" />
                            Choose Photo
                          </Button>
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="mt-6 max-w-sm mx-auto lg:mx-0">
                        <div className="flex items-start gap-3 text-xs text-neutral-500">
                          <Zap className="h-4 w-4 flex-shrink-0 mt-0.5 text-neutral-400" />
                          <p>Best results: full-body, facing camera, good lighting</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center lg:text-left">
                        <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 mb-3">
                          Ready to try on
                        </h1>
                        <p className="text-neutral-500">
                          Your photo is ready. Hit generate to see the magic!
                        </p>
                      </div>

                      {/* Photo Preview */}
                      <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-neutral-100 shadow-xl">
                        <Image
                          src={userPhotoPreview}
                          alt="Your photo"
                          fill
                          sizes="(max-width: 640px) 100vw, 384px"
                          className="object-cover"
                        />
                        
                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
                        >
                          <X className="h-4 w-4 text-neutral-700" />
                        </button>
                        
                        {/* Change photo */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all text-sm text-neutral-700 flex items-center gap-2"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Change
                        </button>
                      </div>

                      {/* Generate Button */}
                      <div className="max-w-sm mx-auto lg:mx-0">
                        <Button
                          onClick={handleGenerate}
                          className="w-full h-14 text-base font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl gap-2"
                        >
                          <Sparkles className="h-5 w-5" />
                          Generate Try-On
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Loading Step */}
            {step === "loading" && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative w-32 h-32 mb-8">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border border-neutral-200" />
                  {/* Spinning ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-neutral-900 animate-spin" />
                  {/* Inner spinning ring */}
                  <div className="absolute inset-4 rounded-full border border-transparent border-t-neutral-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-neutral-400" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-light text-neutral-900 mb-3">
                  Creating Your Look
                </h2>
                <p className="text-neutral-500 mb-6">{loadingMessage}</p>
                
                {/* Progress bar */}
                <div className="w-64 h-1 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((elapsedTime / 15) * 100, 95)}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-4">
                  Usually takes 10-15 seconds
                </p>
              </div>
            )}

            {/* Result Step */}
            {step === "result" && tryOnResult && (
              <div className="grid lg:grid-cols-5 gap-6 lg:gap-10 items-center">
                {/* Left - Result Image */}
                <div className="lg:col-span-3">
                  <div className="text-center lg:text-left mb-6">
                    <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 mb-2">
                      Your Look
                    </h1>
                    <p className="text-neutral-500 flex items-center justify-center lg:justify-start gap-2">
                      <Clock className="h-4 w-4" />
                      Available for {getExpiryHours()} hours
                    </p>
                  </div>

                  <div className="relative aspect-[3/4] max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-neutral-100 shadow-xl">
                    <Image
                      src={tryOnResult.image_url}
                      alt={`You wearing ${item.name}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 448px"
                      className="object-cover"
                    />
                  </div>

                  {/* Actions */}
                  <div className="max-w-md mx-auto lg:mx-0 flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="flex-1 h-12 rounded-xl gap-2 border-neutral-300"
                    >
                      <Download className="h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      className="flex-1 h-12 rounded-xl gap-2 border-neutral-300"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="h-12 px-4 rounded-xl border-neutral-300"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Right - Product & Buy */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm">
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-4">
                      {images.length > 0 && (
                        <Image
                          src={images[0]}
                          alt={item.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mb-4">
                      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
                        {shop?.name}
                      </p>
                      <h2 className="text-lg font-medium text-neutral-900 mb-1">
                        {item.name}
                      </h2>
                      {item.price > 0 && (
                        <p className="text-xl font-semibold text-neutral-900">
                          {formatPrice(item.price, item.currency)}
                        </p>
                      )}
                    </div>

                    {/* Buy Button */}
                    {shop?.whatsapp && (
                      <Button
                        asChild
                        className="w-full h-12 text-base font-medium bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl gap-2"
                      >
                        <a
                          href={generateWhatsAppLink(
                            shop.whatsapp,
                            `Hi! I just tried on "${item.name}" virtually and I love it! I'd like to purchase it.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ShoppingBag className="h-5 w-5" />
                          I Want This
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Step */}
            {step === "error" && tryOnError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  {tryOnError.code === "RATE_LIMIT_EXCEEDED" ? (
                    <Clock className="h-8 w-8 text-red-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  )}
                </div>
                
                <h2 className="text-2xl font-light text-neutral-900 mb-3">
                  {tryOnError.code === "RATE_LIMIT_EXCEEDED"
                    ? "Limit Reached"
                    : tryOnError.code === "AUTH_REQUIRED"
                    ? "Login Required"
                    : "Something Went Wrong"}
                </h2>
                <p className="text-neutral-500 mb-8 max-w-sm">
                  {tryOnError.message}
                </p>

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
                    className="rounded-xl bg-neutral-900 hover:bg-neutral-800"
                  >
                    Log In
                  </Button>
                ) : tryOnError.code !== "RATE_LIMIT_EXCEEDED" &&
                  tryOnError.code !== "SHOP_NO_CREDITS" ? (
                  <Button 
                    onClick={handleReset} 
                    className="rounded-xl gap-2 bg-neutral-900 hover:bg-neutral-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="py-4 text-center">
          <p className="text-xs text-neutral-400">
            🔒 Your photo is processed securely and automatically deleted after 48 hours
          </p>
        </div>
      </main>
    </div>
  );
}
