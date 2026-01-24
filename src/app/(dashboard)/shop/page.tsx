"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import type { Shop, CreateShopRequest } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Settings, Package, Share2, Plus, ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ShopPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  // Fetch user's shop
  const { data: shop, isLoading, error } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => shopService.getMyShop(),
  });

  // Create shop form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateShopRequest>({
    name: "",
    description: "",
    contact_email: "",
    contact_whatsapp: "",
  });

  // Create shop mutation
  const createShopMutation = useMutation({
    mutationFn: (data: CreateShopRequest) => shopService.createShop(data),
    onSuccess: (newShop) => {
      queryClient.setQueryData(["my-shop"], newShop);
      toast.success("Shop created successfully!");
      setShowCreateForm(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Shop name is required");
      return;
    }
    createShopMutation.mutate(formData);
  };

  const shopUrl = shop ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shop/${shop.slug}` : '';

  const copyShopLink = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    toast.success("Shop link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No shop yet - show create form
  if (!shop) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="text-center mb-8">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Create Your Digital Shop</h1>
          <p className="text-muted-foreground">
            Set up your shop to showcase and share your clothing items with customers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shop Details</CardTitle>
            <CardDescription>
              Enter your shop information. You can always update this later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateShop} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  placeholder="My Fashion Store"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your shop..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@yourshop.com"
                  value={formData.contact_email || ""}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  placeholder="+255712345678"
                  value={formData.contact_whatsapp || ""}
                  onChange={(e) => setFormData({ ...formData, contact_whatsapp: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Include country code. Customers can contact you via WhatsApp.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={createShopMutation.isPending}>
                {createShopMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Shop...
                  </>
                ) : (
                  <>
                    <Store className="mr-2 h-4 w-4" />
                    Create Shop
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Shop exists - show dashboard
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            {shop.is_active ? (
              <Badge variant="default" className="bg-green-500">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">{shop.description || "No description"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/shop/${shop.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Shop
            </Link>
          </Button>
          <Button variant="outline" onClick={copyShopLink}>
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>

      {/* Shop URL Card */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Share2 className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Your Shop Link</p>
              <code className="text-sm bg-muted px-3 py-1.5 rounded-md block overflow-x-auto">
                {shopUrl}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => router.push("/shop/items")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Items</h3>
                <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => router.push("/shop/items/new")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Plus className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Add New Item</h3>
                <p className="text-sm text-muted-foreground">Add a product to your shop</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => router.push("/shop/settings")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Settings className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold">Shop Settings</h3>
                <p className="text-sm text-muted-foreground">Update shop details & branding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shop Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Preview</CardTitle>
          <CardDescription>This is how your shop appears to customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            {/* Banner */}
            <div
              className="h-32 bg-gradient-to-r from-gray-700 to-gray-900"
              style={shop.banner_image ? { backgroundImage: `url(${shop.banner_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: shop.theme_color }}
            />

            {/* Shop Info */}
            <div className="p-6 -mt-12 relative">
              <div className="flex items-end gap-4">
                {/* Logo */}
                <div
                  className="w-20 h-20 rounded-lg bg-white border-4 border-white shadow-lg flex items-center justify-center"
                  style={shop.logo_image ? { backgroundImage: `url(${shop.logo_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!shop.logo_image && <Store className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="pb-1">
                  <h2 className="text-xl font-bold">{shop.name}</h2>
                  <p className="text-sm text-muted-foreground">@{shop.slug}</p>
                </div>
              </div>
              {shop.description && (
                <p className="mt-4 text-muted-foreground">{shop.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
