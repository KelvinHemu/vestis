"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Settings, Package, Share2, Plus, ExternalLink, Copy, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import CardDecorator from "./components/CardDecorator";
import { features } from "./components/features";
import ShopForm, { type ShopFormValues } from "./components/ShopForm";
import HowItWorks from "./components/HowItWorks";
import { useMyShop, useCreateShop } from "@/hooks/useShop";

export default function ShopPage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1); // 1 = intro, 2 = form, 3 = how it works

  // Fetch user's shop with caching
  const { data: shop, isLoading } = useMyShop();

  // Create shop mutation
  const createShopMutation = useCreateShop();

  const onSubmit = (data: ShopFormValues) => {
    createShopMutation.mutate({
      name: data.name,
      description: data.description || "",
      contact_email: data.contact_email || "",
      contact_whatsapp: data.contact_whatsapp || "",
    }, {
      onSuccess: () => {
        setStep(3); // Go to "How It Works" after successful creation
      }
    });
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

  // No shop yet - show create flow
  if (!shop) {
    // Step 1: Introduction
    if (step === 1) {
      return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="mx-auto max-w-5xl px-6 w-full">
            {/* Hero Section - Two Column Layout */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
              {/* Image on Left */}
              <div className="flex-shrink-0 order-2 md:order-1">
                <img
                  src="https://res.cloudinary.com/ds4lpuk8p/image/upload/v1769525927/shop_upbm1a.png"
                  alt="Open your shop"
                  className="w-[280px] md:w-[320px] lg:w-[380px]"
                  draggable={false}
                />
              </div>

              {/* Text Content on Right */}
              <div className="flex-1 text-center md:text-left order-1 md:order-2">
                <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
                  Open Your Digital Shop
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Start Selling with Easy Online. Create your own storefront and start selling today.
                </p>
                
                {/* CTA */}
                <div className="mt-6 md:mt-8">
                  <Button 
                    size="lg" 
                    onClick={() => setStep(2)} 
                    className="h-12 px-8 text-lg rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Form
    if (step === 2) {
      return (
        <ShopForm
          onSubmit={onSubmit}
          onBack={() => setStep(1)}
          isPending={createShopMutation.isPending}
        />
      );
    }

    // Step 3: How It Works (after shop creation)
    if (step === 3 && createShopMutation.data) {
      return (
        <HowItWorks
          shopName={createShopMutation.data.name}
          onContinue={() => router.refresh()}
        />
      );
    }

    // Fallback to intro
    return null;
  }

  // Shop exists - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Glassy Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-semibold">{shop.name}</h1>
                {shop.is_active ? (
                  <Badge className="bg-green-500/90 hover:bg-green-500 text-white border-0">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{shop.description || "No description"}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" asChild className="h-9">
                <Link href={`/shop/${shop.slug}`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Shop
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={copyShopLink} className="h-9">
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card 
          className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group" 
          onClick={() => router.push("/shop/items")}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">Manage Items</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Add, edit, or remove products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-green-500/50 hover:shadow-sm transition-all cursor-pointer group" 
          onClick={() => router.push("/shop/items/new")}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-lg transition-colors">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">Add New Item</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Add a product to your shop</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-orange-500/50 hover:shadow-sm transition-all cursor-pointer group" 
          onClick={() => router.push("/shop/settings")}
        >
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-lg transition-colors">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-black dark:text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">Shop Settings</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Update shop details & branding</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shop Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Shop Preview</CardTitle>
          <CardDescription className="text-sm">This is how your shop appears to customers</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border rounded-xl overflow-hidden bg-muted/30">
            {/* Banner */}
            <div
              className="h-24 sm:h-32 bg-gradient-to-r from-slate-700 to-slate-900"
              style={shop.banner_image ? { backgroundImage: `url(${shop.banner_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { backgroundColor: shop.theme_color }}
            />

            {/* Shop Info */}
            <div className="p-4 sm:p-6 -mt-10 sm:-mt-12 relative">
              <div className="flex items-end gap-3 sm:gap-4">
                {/* Logo */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-background border-4 border-background shadow-lg flex items-center justify-center flex-shrink-0"
                  style={shop.logo_image ? { backgroundImage: `url(${shop.logo_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!shop.logo_image && <Store className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />}
                </div>
                <div className="pb-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold truncate">{shop.name}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">@{shop.slug}</p>
                </div>
              </div>
              {shop.description && (
                <p className="mt-3 sm:mt-4 text-sm text-muted-foreground line-clamp-2">{shop.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
