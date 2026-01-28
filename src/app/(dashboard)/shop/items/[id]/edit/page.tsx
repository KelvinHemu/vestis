"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import type { UpdateShopItemRequest } from "@/types/shop";
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
  DollarSign, 
  Palette, 
  Ruler, 
  Eye,
  Info,
  CheckCircle2,
  Save
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

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

export default function EditShopItemPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const itemId = parseInt(params.id as string);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["my-shop-item", itemId],
    queryFn: () => shopService.getMyShopItem(itemId),
    enabled: !isNaN(itemId),
  });

  const [formData, setFormData] = useState<UpdateShopItemRequest>({});
  const [newColor, setNewColor] = useState("");

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price,
        currency: item.currency,
        category: item.category || "",
        images: item.images,
        sizes: item.sizes || [],
        colors: item.colors || [],
        is_available: item.is_available,
        display_order: item.display_order,
      });
    }
  }, [item]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateShopItemRequest) => shopService.updateShopItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop-items"] });
      queryClient.invalidateQueries({ queryKey: ["my-shop-item", itemId] });
      toast.success("Item updated!");
      router.push("/shop/items");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Item name is required");
      return;
    }
    if (!formData.images || formData.images.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    updateMutation.mutate(formData);
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

  const removeImage = (index: number) => {
    const images = [...(formData.images || [])];
    images.splice(index, 1);
    setFormData({ ...formData, images });
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
      const currentImages = formData.images || [];
      const totalImages = [...currentImages, ...newImages];
      if (totalImages.length > 10) {
        toast.warning("Maximum 10 images allowed.");
      }
      setFormData({ ...formData, images: totalImages.slice(0, 10) });
      if (newImages.length > 0) {
        toast.success(`${Math.min(newImages.length, 10 - currentImages.length)} image(s) added`);
      }
    } catch (error) {
      toast.error("Failed to process images");
    } finally {
      setUploadingImages(false);
    }
  }, [formData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) await processFiles(files);
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
    await processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const selectedCurrency = CURRENCIES.find(c => c.value === formData.currency);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Item not found</p>
          <Button asChild>
            <Link href="/shop/items">Back to Items</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/shop/items"><ArrowLeft className="h-5 w-5" /></Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Edit Item</h1>
                <p className="text-sm text-muted-foreground">Update product details</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/shop/items">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                form="edit-item-form"
                disabled={updateMutation.isPending}
                style={{ backgroundColor: '#000000', color: 'white' }}
                className="font-medium px-6 hover:opacity-90"
              >
                {updateMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save Changes</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-8 px-4 sm:px-6">
        <form id="edit-item-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2"><ImagePlus className="h-5 w-5 text-primary" /></div>
                    <div>
                      <CardTitle className="text-lg">Product Images</CardTitle>
                      <CardDescription>{formData.images?.length || 0}/10 images • First is main</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {(formData.images?.length || 0) > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {formData.images?.map((image, index) => (
                        <div key={index} className={cn("group relative aspect-square rounded-xl overflow-hidden border-2 transition-all", index === 0 ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted-foreground/30")}>
                          <Image src={image} alt={`Product ${index + 1}`} fill className="object-cover" unoptimized={image.startsWith('data:')} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }} className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-all transform scale-75 group-hover:scale-100">
                              <X className="h-4 w-4 text-white" />
                            </button>
                          </div>
                          {index === 0 && <Badge className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs">Main</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={cn("relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer hover:border-primary/50 hover:bg-primary/5", isDragging && "border-primary bg-primary/10 scale-[1.02]", (formData.images?.length || 0) === 0 ? "min-h-[200px]" : "min-h-[80px]")}>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImages || (formData.images?.length || 0) >= 10} />
                    <div className="flex flex-col items-center justify-center text-center">
                      {uploadingImages ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : (
                        <>
                          <div className="p-2 bg-muted rounded-full mb-2"><Upload className="h-5 w-5 text-muted-foreground" /></div>
                          <p className="font-medium text-sm">{isDragging ? "Drop images here" : "Add more images"}</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP up to 10MB each</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2"><Eye className={cn("h-5 w-5", formData.is_available ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} /></div>
                      <div>
                        <Label className="text-base font-medium">Availability</Label>
                        <p className="text-sm text-muted-foreground">{formData.is_available ? "Visible in your shop" : "Hidden from customers"}</p>
                      </div>
                    </div>
                    <Switch checked={formData.is_available} onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2"><Info className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Product Name <span className="text-red-500">*</span></Label>
                    <Input id="name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Summer Floral Maxi Dress" className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                    <Textarea id="description" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your product's features, materials, and style..." rows={4} className="resize-none" />
                    <p className="text-xs text-muted-foreground">A good description helps customers understand your product better</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <Select value={formData.category || ""} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="h-11"><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2"><DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
                    <CardTitle className="text-lg">Pricing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium">Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{selectedCurrency?.symbol}</span>
                        <Input id="price" type="number" min="0" step="0.01" value={formData.price || ""} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="h-11 pl-10" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-sm font-medium">Currency</Label>
                      <Select value={formData.currency || "TZS"} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.symbol} {c.value}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2"><Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div>
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
                        <button key={size} type="button" onClick={() => toggleSize(size)} className={cn("h-11 px-5 rounded-lg font-medium text-sm transition-all border-2 flex items-center gap-1.5", isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-transparent hover:bg-muted border-muted-foreground/30 hover:border-muted-foreground/50 text-muted-foreground")}>
                          {isSelected && <CheckCircle2 className="h-4 w-4" />}
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2"><Palette className="h-5 w-5 text-pink-600 dark:text-pink-400" /></div>
                    <div>
                      <CardTitle className="text-lg">Colors</CardTitle>
                      <CardDescription>Add available colors for this product</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(formData.colors?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colors?.map((color) => {
                        const presetColor = PRESET_COLORS.find(c => c.name === color);
                        return (
                          <Badge key={color} variant="secondary" className="pl-2 pr-1 py-1.5 text-sm gap-2">
                            {presetColor && <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: presetColor.value }} />}
                            {color}
                            <button type="button" onClick={() => removeColor(color)} className="p-0.5 hover:bg-muted-foreground/20 rounded-full"><X className="h-3 w-3" /></button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => {
                        const isSelected = formData.colors?.includes(color.name);
                        return (
                          <button key={color.name} type="button" onClick={() => isSelected ? removeColor(color.name) : addPresetColor(color.name)} className={cn("w-8 h-8 rounded-full border-2 transition-all relative", isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110", color.value === "#FFFFFF" && "border-gray-300")} style={{ backgroundColor: color.value }} title={color.name}>
                            {isSelected && <CheckCircle2 className={cn("h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", color.value === "#FFFFFF" || color.value === "#EAB308" ? "text-black" : "text-white")} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Custom color name..." className="h-10" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())} />
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10" onClick={addColor}><Plus className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
