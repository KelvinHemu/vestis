"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import { generationService } from "@/services/generationService";
import type { Generation } from "@/types/generation";
import type { CreateItemFromGenerationRequest } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Check, Plus, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

const CURRENCIES = ["USD", "TZS", "KES", "UGX", "EUR", "GBP"];
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export default function AddFromGenerationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check if user has a shop
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => shopService.getMyShop(),
  });

  // Fetch user's generations
  const { data: generationsData, isLoading: generationsLoading } = useQuery({
    queryKey: ["generations", { page: 1, page_size: 50 }],
    queryFn: () => generationService.list(1, 50),
    enabled: !!shop,
  });

  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateItemFromGenerationRequest>({
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    category: "",
    sizes: [],
    colors: [],
  });
  const [newColor, setNewColor] = useState("");

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: ({ generationId, data }: { generationId: number; data: CreateItemFromGenerationRequest }) =>
      shopService.createItemFromGeneration(generationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop-items"] });
      toast.success("Item added to your shop!");
      router.push("/shop/items");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSelectGeneration = (generation: Generation) => {
    setSelectedGeneration(generation);
    setFormData({
      ...formData,
      name: `${generation.feature_type.charAt(0).toUpperCase() + generation.feature_type.slice(1)} Generation`,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGeneration) return;
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }
    createMutation.mutate({
      generationId: selectedGeneration.id,
      data: formData,
    });
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

  const isLoading = shopLoading || generationsLoading;
  const generations = generationsData?.generations || [];

  if (isLoading) {
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
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shop/items">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add from Generations</h1>
          <p className="text-muted-foreground">Select an AI-generated image to add as a shop item</p>
        </div>
      </div>

      {generations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No generations yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Create some AI-generated images first, then you can add them to your shop.
            </p>
            <Button asChild>
              <Link href="/create">Create Generation</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {generations.map((generation) => (
            <Card
              key={generation.id}
              className={`overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                selectedGeneration?.id === generation.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelectGeneration(generation)}
            >
              <div className="aspect-square relative bg-muted">
                <Image
                  src={generation.image_url}
                  alt={`Generation ${generation.id}`}
                  fill
                  className="object-cover"
                />
                {selectedGeneration?.id === generation.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary rounded-full p-2">
                      <Check className="h-6 w-6 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate capitalize">
                  {generation.feature_type.replace("_", " ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(generation.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Item Details Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Item Details</DialogTitle>
            <DialogDescription>
              Complete the details for this item
            </DialogDescription>
          </DialogHeader>

          {selectedGeneration && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Preview */}
              <div className="flex gap-4">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedGeneration.image_url}
                    alt="Selected generation"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Dresses, Tops"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Pricing */}
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
                    placeholder="Add color"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" variant="outline" onClick={addColor}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add to Shop"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
