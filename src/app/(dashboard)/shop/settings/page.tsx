"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import type { Shop, UpdateShopRequest } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, Upload, Trash2, Store } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ShopSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch user's shop
  const { data: shop, isLoading } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => shopService.getMyShop(),
  });

  const [formData, setFormData] = useState<UpdateShopRequest>({});
  const [slugInput, setSlugInput] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Initialize form data when shop loads
  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name,
        description: shop.description || "",
        theme_color: shop.theme_color,
        email: shop.email || "",
        phone: shop.phone || "",
        whatsapp: shop.whatsapp || "",
        is_active: shop.is_active,
      });
      setSlugInput(shop.slug);
    }
  }, [shop]);

  // Update shop mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateShopRequest) => shopService.updateMyShop(data),
    onSuccess: (updatedShop) => {
      queryClient.setQueryData(["my-shop"], updatedShop);
      toast.success("Shop updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete shop mutation
  const deleteMutation = useMutation({
    mutationFn: () => shopService.deleteMyShop(),
    onSuccess: () => {
      queryClient.setQueryData(["my-shop"], null);
      toast.success("Shop deleted successfully");
      router.push("/shop");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Upload logo mutation
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => shopService.uploadShopLogo(file),
    onSuccess: (updatedShop) => {
      queryClient.setQueryData(["my-shop"], updatedShop);
      toast.success("Logo uploaded!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Upload banner mutation
  const uploadBannerMutation = useMutation({
    mutationFn: (file: File) => shopService.uploadShopBanner(file),
    onSuccess: (updatedShop) => {
      queryClient.setQueryData(["my-shop"], updatedShop);
      toast.success("Banner uploaded!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: UpdateShopRequest = { ...formData };
    if (slugInput !== shop?.slug) {
      updates.slug = slugInput;
    }
    updateMutation.mutate(updates);
  };

  const checkSlugAvailability = async () => {
    if (!slugInput || slugInput === shop?.slug) {
      setSlugAvailable(null);
      return;
    }
    setIsCheckingSlug(true);
    try {
      const result = await shopService.checkSlugAvailability(slugInput);
      setSlugAvailable(result.available);
      setSlugInput(result.slug); // Use normalized slug
    } catch (error) {
      toast.error("Failed to check slug availability");
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogoMutation.mutate(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadBannerMutation.mutate(file);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="w-full px-6 sm:px-8 lg:px-12 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link href="/shop">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Shop Settings</h1>
                <p className="text-sm text-muted-foreground">Manage your shop details and branding</p>
              </div>
            </div>
            <Button type="submit" form="shop-settings-form" disabled={updateMutation.isPending}
              style={{ backgroundColor: '#000000', color: 'white' }}
              className="font-medium px-6 hover:opacity-90"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-6 sm:px-8">
        <form id="shop-settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <CardDescription>Your shop's public details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Shop Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium">Shop URL</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex">
                  <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md">
                    /shop/
                  </span>
                  <Input
                    id="slug"
                    value={slugInput}
                    onChange={(e) => {
                      setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setSlugAvailable(null);
                    }}
                    onBlur={checkSlugAvailability}
                    className="rounded-l-none h-11"
                  />
                </div>
                {isCheckingSlug && <Loader2 className="h-5 w-5 animate-spin self-center" />}
              </div>
              {slugAvailable !== null && slugInput !== shop.slug && (
                <p className={`text-sm ${slugAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {slugAvailable ? '✓ This URL is available' : '✗ This URL is already taken'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Shop Active</Label>
                <p className="text-sm text-muted-foreground">
                  When disabled, your shop won't be visible to customers
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Branding</CardTitle>
            <CardDescription>Customize your shop's appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Shop Logo</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/50"
                  style={shop.logo_image ? { backgroundImage: `url(${shop.logo_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!shop.logo_image && <Store className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    disabled={uploadLogoMutation.isPending}
                  >
                    {uploadLogoMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground">Recommended: 200x200px</p>
                </div>
              </div>
            </div>

            {/* Banner */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Shop Banner</Label>
              <div 
                className="h-36 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden"
                style={shop.banner_image ? { backgroundImage: `url(${shop.banner_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: shop.theme_color || '#f5f5f5' }}
              >
                {!shop.banner_image && <p className="text-muted-foreground text-sm">No banner uploaded</p>}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  id="banner-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('banner-upload')?.click()}
                  disabled={uploadBannerMutation.isPending}
                >
                  {uploadBannerMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload Banner
                </Button>
                <p className="text-xs text-muted-foreground">Recommended: 1200x300px</p>
              </div>
            </div>

            {/* Theme Color */}
            <div className="space-y-3">
              <Label htmlFor="theme_color" className="text-sm font-medium">Theme Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  id="theme_color"
                  value={formData.theme_color || "#000000"}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="w-12 h-11 rounded-lg border cursor-pointer"
                />
                <Input
                  value={formData.theme_color || "#000000"}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="w-32 h-11"
                  maxLength={7}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>How customers can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="+255712345678"
                value={formData.whatsapp || ""}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Include country code. Used for &quot;Inquire via WhatsApp&quot; button.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-0 shadow-lg border-destructive/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your shop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Delete Shop</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your shop and all items
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Shop
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your shop
                      and all items in it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Delete Shop
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
        </form>
      </div>
    </div>
  );
}
