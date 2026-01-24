"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopService } from "@/services/shopService";
import type { ShopItem } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Plus, Pencil, Trash2, Package, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ShopItemsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  // Fetch user's shop
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => shopService.getMyShop(),
  });

  // Fetch shop items
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ["my-shop-items"],
    queryFn: () => shopService.listMyShopItems({ page_size: 50 }),
    enabled: !!shop,
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => shopService.deleteShopItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop-items"] });
      toast.success("Item deleted");
      setDeleteItemId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = shopLoading || itemsLoading;
  const items = itemsData?.items || [];

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/shop">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Shop Items</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} in your shop
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/shop/items/from-generation">
              <ImageIcon className="mr-2 h-4 w-4" />
              Add from Generations
            </Link>
          </Button>
          <Button asChild>
            <Link href="/shop/items/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No items yet</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start adding items to your shop. You can create new items or add from your AI generations.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/shop/items/from-generation">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Add from Generations
                </Link>
              </Button>
              <Button asChild>
                <Link href="/shop/items/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Item
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              {/* Image */}
              <div className="aspect-square relative bg-muted">
                {item.images?.[0] ? (
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/shop/items/${item.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteItemId(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Availability badge */}
                {!item.is_available && (
                  <Badge variant="secondary" className="absolute top-2 left-2">
                    Hidden
                  </Badge>
                )}
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-lg font-bold text-primary">
                  {item.currency} {item.price.toFixed(2)}
                </p>
                {item.category && (
                  <Badge variant="outline" className="mt-2">
                    {item.category}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteItemId !== null} onOpenChange={() => setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItemId && deleteMutation.mutate(deleteItemId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
