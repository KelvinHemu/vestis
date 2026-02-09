/**
 * Cart Store - Zustand store for managing shopping cart state
 * 
 * Each cart entry gets a unique composite key built from
 * (itemId + shopSlug + size + color) so the same product
 * in different variants lives as separate cart rows.
 * 
 * Features:
 * - Add/remove items (variant-aware)
 * - Update quantities (variant-aware)
 * - Persist to localStorage
 * - Calculate totals
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShopItem } from '@/types/shop';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a deterministic, unique string key for a cart entry.
 * Two entries with the same product but different size/color
 * produce different keys, so each variant is tracked independently.
 */
export function buildCartItemKey(
  itemId: number,
  shopSlug: string,
  size?: string,
  color?: string,
): string {
  return `${itemId}::${shopSlug}::${size ?? ''}::${color ?? ''}`;
}

// ============================================================================
// Types
// ============================================================================

export interface CartItem {
  /** Deterministic composite key (itemId::shopSlug::size::color) */
  cartItemKey: string;
  item: ShopItem;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  shopSlug: string; // Track which shop this item belongs to
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: ShopItem, shopSlug: string, options?: { size?: string; color?: string }) => void;
  removeItem: (cartItemKey: string) => void;
  updateQuantity: (cartItemKey: string, quantity: number) => void;
  clearCart: () => void;
  clearShopCart: (shopSlug: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getShopItemCount: (shopSlug: string) => number;
  getSubtotal: () => number;
  getShopSubtotal: (shopSlug: string) => number;
  getShopItems: (shopSlug: string) => CartItem[];
}

// ============================================================================
// Migration — backfill cartItemKey for entries stored before this update
// ============================================================================

/**
 * Older localStorage payloads may lack the `cartItemKey` field.
 * This helper patches every entry so the rest of the store logic
 * can rely on the key always being present.
 */
function migrateCartItems(items: CartItem[]): CartItem[] {
  return items.map((entry) => {
    // Already has a key — nothing to do
    if (entry.cartItemKey) return entry;

    // Build the key from the item's own data
    return {
      ...entry,
      cartItemKey: buildCartItemKey(
        entry.item.id,
        entry.shopSlug,
        entry.selectedSize,
        entry.selectedColor,
      ),
    };
  });
}

// ============================================================================
// Store
// ============================================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // -----------------------------------------------------------------------
      // Add item to cart (or increment quantity if already exists)
      // Uses the composite key to correctly identify duplicate variants
      // -----------------------------------------------------------------------
      addItem: (item, shopSlug, options) => {
        // Build the unique key for this exact variant
        const key = buildCartItemKey(item.id, shopSlug, options?.size, options?.color);

        set((state) => {
          // Check if this exact variant already lives in the cart
          const existingIndex = state.items.findIndex(
            (cartItem) => cartItem.cartItemKey === key
          );

          if (existingIndex >= 0) {
            // Variant already in cart — bump quantity by 1
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + 1,
            };
            return { items: newItems, isOpen: true };
          }

          // Brand-new variant — append to cart
          return {
            items: [
              ...state.items,
              {
                cartItemKey: key,
                item,
                quantity: 1,
                selectedSize: options?.size,
                selectedColor: options?.color,
                shopSlug,
              },
            ],
            isOpen: true, // Open cart drawer so user sees the update
          };
        });
      },

      // -----------------------------------------------------------------------
      // Remove a single cart entry by its composite key
      // -----------------------------------------------------------------------
      removeItem: (cartItemKey) => {
        set((state) => ({
          items: state.items.filter(
            (cartItem) => cartItem.cartItemKey !== cartItemKey
          ),
        }));
      },

      // -----------------------------------------------------------------------
      // Update quantity for a single cart entry by its composite key
      // If quantity drops to 0 or below, the entry is removed entirely.
      // -----------------------------------------------------------------------
      updateQuantity: (cartItemKey, quantity) => {
        if (quantity <= 0) {
          // Delegate to removeItem for a clean removal
          get().removeItem(cartItemKey);
          return;
        }

        set((state) => ({
          items: state.items.map((cartItem) =>
            cartItem.cartItemKey === cartItemKey
              ? { ...cartItem, quantity }
              : cartItem
          ),
        }));
      },

      // -----------------------------------------------------------------------
      // Clear entire cart
      // -----------------------------------------------------------------------
      clearCart: () => {
        set({ items: [] });
      },

      // -----------------------------------------------------------------------
      // Clear cart for a specific shop only
      // -----------------------------------------------------------------------
      clearShopCart: (shopSlug) => {
        set((state) => ({
          items: state.items.filter((cartItem) => cartItem.shopSlug !== shopSlug),
        }));
      },

      // -----------------------------------------------------------------------
      // Cart drawer controls
      // -----------------------------------------------------------------------
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // -----------------------------------------------------------------------
      // Get total item count across all shops
      // -----------------------------------------------------------------------
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // -----------------------------------------------------------------------
      // Get item count for a specific shop
      // -----------------------------------------------------------------------
      getShopItemCount: (shopSlug) => {
        return get().items
          .filter((item) => item.shopSlug === shopSlug)
          .reduce((total, item) => total + item.quantity, 0);
      },

      // -----------------------------------------------------------------------
      // Get subtotal across all shops
      // -----------------------------------------------------------------------
      getSubtotal: () => {
        return get().items.reduce(
          (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
          0
        );
      },

      // -----------------------------------------------------------------------
      // Get subtotal for a specific shop
      // -----------------------------------------------------------------------
      getShopSubtotal: (shopSlug) => {
        return get().items
          .filter((item) => item.shopSlug === shopSlug)
          .reduce(
            (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
            0
          );
      },

      // -----------------------------------------------------------------------
      // Get cart items belonging to a specific shop
      // -----------------------------------------------------------------------
      getShopItems: (shopSlug) => {
        return get().items.filter((item) => item.shopSlug === shopSlug);
      },
    }),
    {
      name: 'vestis-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the items array, not transient UI state like isOpen
      partialize: (state) => ({ items: state.items }),
      // Run migration on rehydrate so older payloads get backfilled keys
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = migrateCartItems(state.items);
        }
      },
    }
  )
);

export default useCartStore;

