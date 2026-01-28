"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { shopService, formatPrice, generateWhatsAppLink, generateEmailLink } from "@/services/shopService";
import { onModelPhotosService } from "@/services/onModelPhotosService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, MessageCircle, Mail, ChevronLeft, ChevronRight, Share2, Check, ShoppingBag, Sparkles, Upload, X, Camera } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PublicItemPage() {
  const params = useParams();
  const slug = params.slug as string;
  const itemId = parseInt(params.id as string);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Try On states
  const [showTryOnModal, setShowTryOnModal] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const tryOnFileInputRef = useRef<HTMLInputElement>(null);

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

  // File to base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle user photo upload for Try On
  const handleTryOnPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    try {
      const base64 = await fileToBase64(file);
      setUserPhoto(base64);
      setTryOnResult(null);
    } catch {
      toast.error("Failed to load image");
    }
  };

  // Generate Try On result
  const handleGenerateTryOn = async () => {
    if (!userPhoto || images.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Use the current displayed product image as the clothing item
      const clothingImage = images[currentImageIndex];
      
      // For now, show a message that this feature requires authentication
      // In a real implementation, you'd call the on-model API
      toast.info("Try On feature coming soon!", {
        description: "This virtual try-on feature will be available soon. Please contact the seller to learn more about this item.",
      });
      
      // Simulate the result with a placeholder message
      setTryOnResult("coming-soon");
    } catch (error) {
      toast.error("Failed to generate try-on. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset Try On modal
  const resetTryOn = () => {
    setUserPhoto(null);
    setTryOnResult(null);
    setIsGenerating(false);
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

            {/* Buy and Try On Buttons */}
            {item.is_available && (
              <div className="grid grid-cols-2 gap-3 pt-4">
                {/* Buy Button */}
                <Button
                  asChild
                  className="bg-black hover:bg-black/90 text-white h-12 text-base font-medium"
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
                  className="h-12 text-base font-medium border-2 hover:bg-muted"
                  size="lg"
                  onClick={() => setShowTryOnModal(true)}
                >
                  Try On
                </Button>
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

      {/* Try On Modal */}
      <Dialog open={showTryOnModal} onOpenChange={(open) => {
        setShowTryOnModal(open);
        if (!open) resetTryOn();
      }}>
        <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5" />
              Virtual Try On
            </DialogTitle>
            <DialogDescription>
              Upload your photo to see how this item would look on you
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Photo Upload */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Your Photo</h3>
                <input
                  ref={tryOnFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTryOnPhotoUpload}
                  className="hidden"
                />
                
                {!userPhoto ? (
                  <button
                    type="button"
                    onClick={() => tryOnFileInputRef.current?.click()}
                    className="w-full aspect-[3/4] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="p-4 bg-muted rounded-full">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Upload your photo</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Full body photo works best
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden border">
                    <Image
                      src={userPhoto}
                      alt="Your photo"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUserPhoto(null);
                        setTryOnResult(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/60 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Product Image / Result */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">
                  {tryOnResult ? "Try On Result" : "Product"}
                </h3>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border bg-muted">
                  {tryOnResult === "coming-soon" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <Sparkles className="h-12 w-12 text-primary mb-4" />
                      <h4 className="font-semibold text-lg mb-2">Coming Soon!</h4>
                      <p className="text-sm text-muted-foreground">
                        Virtual try-on is currently in development. Check back soon to see how this item would look on you!
                      </p>
                    </div>
                  ) : images.length > 0 ? (
                    <Image
                      src={images[currentImageIndex]}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">👔</span>
                    </div>
                  )}
                  
                  {isGenerating && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                      <p className="font-medium">Generating your look...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Tips for best results:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use a full-body photo with good lighting</li>
                <li>• Stand in a neutral pose facing the camera</li>
                <li>• Plain backgrounds work best</li>
              </ul>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={() => {
                setShowTryOnModal(false);
                resetTryOn();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateTryOn}
              disabled={!userPhoto || isGenerating}
              className="gap-2 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Try On
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
