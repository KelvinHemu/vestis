"use client";

import { useState } from "react";
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
import { Loader2, ArrowLeft, Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

const CURRENCIES = ["USD", "TZS", "KES", "UGX", "EUR", "GBP"];
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function NewShopItemPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if user has a shop
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => shopService.getMyShop(),
  });

  const [formData, setFormData] = useState<CreateShopItemRequest>({
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    category: "",
    images: [],
    sizes: [],
    colors: [],
    is_available: true,
  });

  const [newColor, setNewColor] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateShopItemRequest) => shopService.createShopItem(data),
    onSuccess: () => {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // For now, we'll use placeholder URLs
    // In production, you'd upload to your image service
    setUploadingImages(true);
    
    try {
      // Create temporary URLs for preview
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Create a local URL for preview - in production, upload to server
        const url = URL.createObjectURL(file);
        newImages.push(url);
      }
      
      setFormData({ 
        ...formData, 
        images: [...formData.images, ...newImages].slice(0, 10) // Max 10 images
      });
      toast.info("Images added. Note: Upload to server happens when you save.");
    } catch (error) {
      toast.error("Failed to process images");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    const images = [...formData.images];
    images.splice(index, 1);
    setFormData({ ...formData, images });
  };

  if (shopLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shop) {
    router.push("/shop");
    return null;
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shop/items">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Item</h1>
          <p className="text-muted-foreground">Create a new product for your shop</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Add up to 10 images. First image is the main image.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="aspect-square relative rounded-lg overflow-hidden border">
                  <Image src={image} alt={`Product ${index + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
              
              {formData.images.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                  {uploadingImages ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Add Images</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Summer Floral Dress"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Dresses, Tops, Pants"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
            <CardDescription>Available sizes and colors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sizes */}
            <div className="space-y-2">
              <Label>Sizes</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={formData.sizes?.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label>Colors</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.colors?.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                  >
                    {color}
                    <button type="button" onClick={() => removeColor(color)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add color (e.g., Red, Blue)"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                />
                <Button type="button" variant="outline" onClick={addColor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Available for Sale</Label>
                <p className="text-sm text-muted-foreground">
                  When disabled, this item won't be visible in your shop
                </p>
              </div>
              <Switch
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/shop/items">Cancel</Link>
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Item"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
