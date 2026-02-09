"use client";

/**
 * CartDrawer - Slide-out cart panel
 * 
 * Clean, minimal design inspired by NOOON.
 * - Slides in from the right
 * - Shows cart items with thumbnails
 * - Variant-aware quantity controls (same product, different size/color)
 * - Subtotal and checkout via WhatsApp
 */

import { useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, generateWhatsAppLink } from "@/services/shopService";
import type { Shop } from "@/types/shop";
import { cn } from "@/lib/utils";

// ============================================================================
// Props
// ============================================================================

interface CartDrawerProps {
  shopSlug: string;
  shop?: Shop | null;
}

// ============================================================================
// Component
// ============================================================================

export function CartDrawer({ shopSlug, shop }: CartDrawerProps) {
  // Pull state and actions from the cart store
  const { isOpen, closeCart, getShopItems, getShopSubtotal, updateQuantity, removeItem } = useCartStore();
  
  // Get only the items that belong to this shop
  const items = getShopItems(shopSlug);
  const subtotal = getShopSubtotal(shopSlug);

  // Default currency from the first item, or fallback to USD
  const currency = items[0]?.item.currency || "USD";

  // Lock body scroll when the drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // -------------------------------------------------------------------------
  // Build the WhatsApp checkout message (itemised list + total)
  // -------------------------------------------------------------------------
  const buildCheckoutMessage = () => {
    let msg = `Hi! I'd like to order from ${shop?.name || "your shop"}:\n\n`;
    
    items.forEach((cartItem, index) => {
      msg += `${index + 1}. ${cartItem.item.name}`;
      if (cartItem.selectedSize) msg += ` (Size: ${cartItem.selectedSize})`;
      if (cartItem.selectedColor) msg += ` (Color: ${cartItem.selectedColor})`;
      msg += ` x${cartItem.quantity}`;
      msg += ` - ${formatPrice(cartItem.item.price * cartItem.quantity, cartItem.item.currency)}\n`;
    });
    
    msg += `\n---\nTotal: ${formatPrice(subtotal, currency)}`;
    return msg;
  };

  // -------------------------------------------------------------------------
  // Checkout handler — opens WhatsApp with the pre-filled order message
  // -------------------------------------------------------------------------
  const handleCheckout = () => {
    if (shop?.whatsapp) {
      const link = generateWhatsAppLink(shop.whatsapp, buildCheckoutMessage());
      window.open(link, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — click to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={closeCart}
          />

          {/* Cart Panel — slides in from the right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
              <h2 className="text-lg font-semibold tracking-wide uppercase">
                Your Cart ({items.length})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                /* ── Empty state ── */
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4" />
                  <p className="text-lg font-medium text-neutral-600 mb-2">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-neutral-400">
                    Add some items to get started
                  </p>
                </div>
              ) : (
                /* ── Item list ── */
                <ul className="divide-y divide-neutral-100">
                  {items.map((cartItem) => (
                    <li key={cartItem.cartItemKey} className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-24 bg-neutral-100 flex-shrink-0">
                          {cartItem.item.images?.[0] ? (
                            <Image
                              src={cartItem.item.images[0]}
                              alt={cartItem.item.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl">👔</span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium uppercase truncate">
                            {cartItem.item.name}
                          </h3>
                          
                          {/* Size / Color info */}
                          {(cartItem.selectedSize || cartItem.selectedColor) && (
                            <p className="text-xs text-neutral-500 mt-1">
                              {cartItem.selectedSize && `Size: ${cartItem.selectedSize}`}
                              {cartItem.selectedSize && cartItem.selectedColor && " / "}
                              {cartItem.selectedColor && `Color: ${cartItem.selectedColor}`}
                            </p>
                          )}

                          {/* Price */}
                          <p className="text-sm font-medium mt-2">
                            {formatPrice(cartItem.item.price, cartItem.item.currency)}
                          </p>

                          {/* Quantity Controls — uses cartItemKey for variant-safe ops */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-neutral-200">
                              {/* Decrement (removes entry when quantity hits 0) */}
                              <button
                                onClick={() => updateQuantity(cartItem.cartItemKey, cartItem.quantity - 1)}
                                className="p-2 hover:bg-neutral-100 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>

                              {/* Current quantity */}
                              <span className="px-4 text-sm font-medium">
                                {cartItem.quantity}
                              </span>

                              {/* Increment */}
                              <button
                                onClick={() => updateQuantity(cartItem.cartItemKey, cartItem.quantity + 1)}
                                className="p-2 hover:bg-neutral-100 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(cartItem.cartItemKey)}
                              className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — Subtotal & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-neutral-200 px-6 py-5 space-y-4 bg-white">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Subtotal</span>
                  <span className="text-lg font-semibold">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={!shop?.whatsapp}
                  className={cn(
                    "w-full py-4 text-sm font-semibold uppercase tracking-wide transition-colors",
                    shop?.whatsapp
                      ? "bg-neutral-900 text-white hover:bg-neutral-800"
                      : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                  )}
                >
                  {shop?.whatsapp ? "Checkout via WhatsApp" : "Contact Shop to Order"}
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={closeCart}
                  className="w-full py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;

