"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import type { CreateShopItemRequest } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  ImagePlus, 
  Sparkles, 
  DollarSign, 
  Palette, 
  Ruler, 
  Eye, 
  CheckCircle2,
  GripVertical,
  Info,
  Cloud,
  CloudOff,
  RotateCcw,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const DRAFT_STORAGE_KEY = "vestis-new-item-draft";

const CURRENCIES = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "TZS", label: "TZS", symbol: "TSh" },
  { value: "KES", label: "KES", symbol: "KSh" },
  { value: "UGX", label: "UGX", symbol: "USh" },
  { value: "EUR", label: "EUR", symbol: "€" },
  { value: "GBP", label: "GBP", symbol: "£" },
];
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const PRESET_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#22C55E" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#A855F7" },
  { name: "Orange", value: "#F97316" },
  { name: "Gray", value: "#6B7280" },
  { name: "Navy", value: "#1E3A5F" },
  { name: "Beige", value: "#D4A574" },
];

const CATEGORIES = [
  "Dresses",
  "Tops",
  "Pants",
  "Skirts",
  "Jackets",
  "Shoes",
  "Accessories",
  "Bags",
  "Jewelry",
  "Other",
];

export default function NewShopItemPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-save states
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Check if user has a shop
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => shopService.getMyShop(),
  });

  const [formData, setFormData] = useState<CreateShopItemRequest>({
    name: "",
    description: "",
    price: 0,
    currency: "TZS",
    category: "",
    images: [],
    sizes: [],
    colors: [],
    is_available: true,
  });

  const [newColor, setNewColor] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          const { data, savedAt } = JSON.parse(savedDraft);
          // Don't load images from draft (blob URLs are invalid after page reload)
          const draftData = { ...data, images: [] };
          setFormData(draftData);
          setLastSaved(new Date(savedAt));
          setHasDraft(true);
          setDraftStatus('saved');
          
          // Show restore notification
          toast.info("Draft restored", {
            description: `Last saved ${formatTimeAgo(new Date(savedAt))}`,
            action: {
              label: "Clear",
              onClick: clearDraft,
            },
          });
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
      isInitializedRef.current = true;
    };

    loadDraft();
  }, []);

  // Auto-save draft with debounce
  useEffect(() => {
    // Don't save on initial load
    if (!isInitializedRef.current) return;
    
    // Don't save empty forms
    const hasContent = formData.name.trim() || formData.description?.trim() || 
                       formData.price > 0 || (formData.sizes?.length || 0) > 0 || 
                       (formData.colors?.length || 0) > 0 || formData.category;
    
    if (!hasContent) {
      setHasDraft(false);
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setDraftStatus('saving');

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const draftData = {
          data: { ...formData, images: [] }, // Don't store blob URLs
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        setLastSaved(new Date());
        setHasDraft(true);
        setDraftStatus('saved');
      } catch (error) {
        console.error("Failed to save draft:", error);
        setDraftStatus('error');
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData]);

  // Clear draft from storage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "TZS",
        category: "",
        images: [],
        sizes: [],
        colors: [],
        is_available: true,
      });
      setHasDraft(false);
      setLastSaved(null);
      setDraftStatus('idle');
      toast.success("Draft cleared");
    } catch (error) {
      toast.error("Failed to clear draft");
    }
  }, []);

  // Format time ago helper
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Calculate form completion percentage
  const completionSteps = [
    formData.images.length > 0,
    formData.name.trim().length > 0,
    formData.price > 0,
    (formData.sizes?.length || 0) > 0,
  ];
  const completionPercentage = Math.round(
    (completionSteps.filter(Boolean).length / completionSteps.length) * 100
  );

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateShopItemRequest) => shopService.createShopItem(data),
    onSuccess: () => {
      // Clear draft on successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      queryClient.invalidateQueries({ queryKey: ["my-shop-items"] });
      toast.success("Item added to your shop!");
      router.push("/shop/items");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (formData.images.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    createMutation.mutate(formData);
  };

  const toggleSize = (size: string) => {
    const sizes = formData.sizes || [];
    if (sizes.includes(size)) {
      setFormData({ ...formData, sizes: sizes.filter((s) => s !== size) });
    } else {
      setFormData({ ...formData, sizes: [...sizes, size] });
    }
  };

  const addColor = () => {
    if (!newColor.trim()) return;
    const colors = formData.colors || [];
    if (!colors.includes(newColor.trim())) {
      setFormData({ ...formData, colors: [...colors, newColor.trim()] });
    }
    setNewColor("");
  };

  const removeColor = (color: string) => {
    const colors = formData.colors || [];
    setFormData({ ...formData, colors: colors.filter((c) => c !== color) });
  };

  const addPresetColor = (colorName: string) => {
    const colors = formData.colors || [];
    if (!colors.includes(colorName)) {
      setFormData({ ...formData, colors: [...colors, colorName] });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    
    try {
      const newImages: string[] = [];
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }
      
      const totalImages = [...formData.images, ...newImages];
      if (totalImages.length > 10) {
        toast.warning("Maximum 10 images allowed. Some images were not added.");
      }
      
      setFormData({ 
        ...formData, 
        images: totalImages.slice(0, 10)
      });
      
      if (newImages.length > 0) {
        toast.success(`${Math.min(newImages.length, 10 - formData.images.length)} image(s) added`);
      }
    } catch (error) {
      toast.error("Failed to process images");
    } finally {
      setUploadingImages(false);
    }
  }, [formData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    await processFiles(files);
  }, [processFiles]);

  const removeImage = (index: number) => {
    const images = [...formData.images];
    images.splice(index, 1);
    setFormData({ ...formData, images });
  };

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    router.push("/shop");
    return null;
  }

  const selectedCurrency = CURRENCIES.find(c => c.value === formData.currency);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/shop/items">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Add New Item</h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Create a product for your shop</p>
                  {/* Draft Status Indicator */}
                  {hasDraft && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">•</span>
                      {draftStatus === 'saving' ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Saving...
                        </span>
                      ) : draftStatus === 'saved' ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Cloud className="h-3 w-3" />
                          Draft saved {lastSaved && formatTimeAgo(lastSaved)}
                        </span>
                      ) : draftStatus === 'error' ? (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <CloudOff className="h-3 w-3" />
                          Failed to save
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Progress Indicator & Actions */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Clear Draft Button */}
              {hasDraft && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearDraft}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{completionPercentage}%</span>
              </div>
              <Button 
                type="submit" 
                form="new-item-form"
                disabled={createMutation.isPending || completionPercentage < 50}
                style={{ 
                  backgroundColor: completionPercentage >= 50 ? '#000000' : '#00000080',
                  color: 'white'
                }}
                className="font-medium px-6 hover:opacity-90"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Publish Item
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 px-4 sm:px-6">
        <form id="new-item-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2">
                      <ImagePlus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Product Images</CardTitle>
                      <CardDescription>
                        {formData.images.length}/10 images • First is main
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {/* Drop Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
                      "hover:border-primary/50 hover:bg-primary/5",
                      isDragging && "border-primary bg-primary/10 scale-[1.02]",
                      formData.images.length === 0 ? "min-h-[200px]" : "min-h-[100px]"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages || formData.images.length >= 10}
                    />
                    
                    <div className="flex flex-col items-center justify-center text-center">
                      {uploadingImages ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      ) : (
                        <>
                          <div className="p-3 bg-muted rounded-full mb-3">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-sm">
                            {isDragging ? "Drop images here" : "Click or drag images"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, WEBP up to 10MB each
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Image Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {formData.images.map((image, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "group relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                            index === 0 ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30"
                          )}
                        >
                          <Image 
                            src={image} 
                            alt={`Product ${index + 1}`} 
                            fill 
                            className="object-cover"
                            unoptimized={image.startsWith('data:')}
                          />
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-all transform scale-75 group-hover:scale-100"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                          
                          {/* Main Badge */}
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs">
                              Main
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Visibility Card */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2">
                        <Eye className={cn(
                          "h-5 w-5",
                          formData.is_available ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <Label className="text-base font-medium">Availability</Label>
                        <p className="text-sm text-muted-foreground">
                          {formData.is_available ? "Visible in your shop" : "Hidden from customers"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.is_available}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Basic Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Product Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Summer Floral Maxi Dress"
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product's features, materials, and style..."
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      A good description helps customers understand your product better
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setFormData({ ...formData, category: customCategory });
                        } else {
                          setFormData({ ...formData, category: value });
                        }
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg">Pricing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          {selectedCurrency?.symbol}
                        </span>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price || ""}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          className="h-11 pl-10"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-sm font-medium">Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData({ ...formData, currency: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.symbol} {c.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sizes */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2">
                      <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Sizes</CardTitle>
                      <CardDescription>Select all available sizes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SIZES.map((size) => {
                      const isSelected = formData.sizes?.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={cn(
                            "h-11 px-5 rounded-lg font-medium text-sm transition-all border-2 flex items-center gap-1.5",
                            isSelected 
                              ? "bg-primary text-primary-foreground border-primary" 
                              : "bg-transparent hover:bg-muted border-muted-foreground/30 hover:border-muted-foreground/50 text-muted-foreground"
                          )}
                        >
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2">
                      <Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Colors</CardTitle>
                      <CardDescription>Add available colors for this product</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Colors */}
                  {(formData.colors?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colors?.map((color) => {
                        const presetColor = PRESET_COLORS.find(c => c.name === color);
                        return (
                          <Badge
                            key={color}
                            variant="secondary"
                            className="pl-2 pr-1 py-1.5 text-sm gap-2"
                          >
                            {presetColor && (
                              <span 
                                className="w-4 h-4 rounded-full border border-black/10"
                                style={{ backgroundColor: presetColor.value }}
                              />
                            )}
                            {color}
                            <button 
                              type="button" 
                              onClick={() => removeColor(color)}
                              className="p-0.5 hover:bg-muted-foreground/20 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Preset Colors */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => {
                        const isSelected = formData.colors?.includes(color.name);
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => isSelected ? removeColor(color.name) : addPresetColor(color.name)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 transition-all relative",
                              isSelected 
                                ? "ring-2 ring-primary ring-offset-2" 
                                : "hover:scale-110",
                              color.value === "#FFFFFF" && "border-gray-300"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          >
                            {isSelected && (
                              <CheckCircle2 className={cn(
                                "h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                                color.value === "#FFFFFF" || color.value === "#EAB308" ? "text-black" : "text-white"
                              )} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Color Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Add custom color (e.g., Burgundy)"
                      className="h-11"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={addColor}
                      className="h-11 px-4"
                      disabled={!newColor.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mobile Fixed Bottom Actions */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t safe-area-inset-bottom">
            {/* Draft indicator for mobile */}
            {hasDraft && (
              <div className="flex items-center justify-between mb-3 pb-3 border-b">
                <div className="flex items-center gap-2">
                  {draftStatus === 'saving' ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving draft...
                    </span>
                  ) : draftStatus === 'saved' ? (
                    <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                      <Cloud className="h-3 w-3" />
                      Draft saved {lastSaved && formatTimeAgo(lastSaved)}
                    </span>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearDraft}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{completionPercentage}% complete</p>
              </div>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || completionPercentage < 50}
                className="rounded-full"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Bottom Spacer */}
          <div className="hidden sm:block h-8" />
        </form>
      </div>
    </div>
  );
}
