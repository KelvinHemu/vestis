/**
 * Cart Store - Zustand store for managing shopping cart state
 * 
 * Features:
 * - Add/remove items
 * - Update quantities
 * - Persist to localStorage
 * - Calculate totals
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShopItem } from '@/types/shop';

// ============================================================================
// Types
// ============================================================================

export interface CartItem {
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
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
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
// Store
// ============================================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // -----------------------------------------------------------------------
      // Add item to cart (or increment quantity if already exists)
      // -----------------------------------------------------------------------
      addItem: (item, shopSlug, options) => {
        set((state) => {
          // Check if item already exists with same size/color
          const existingIndex = state.items.findIndex(
            (cartItem) => 
              cartItem.item.id === item.id && 
              cartItem.shopSlug === shopSlug &&
              cartItem.selectedSize === options?.size &&
              cartItem.selectedColor === options?.color
          );

          if (existingIndex >= 0) {
            // Increment quantity
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + 1,
            };
            return { items: newItems, isOpen: true };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                item,
                quantity: 1,
                selectedSize: options?.size,
                selectedColor: options?.color,
                shopSlug,
              },
            ],
            isOpen: true, // Open cart when adding item
          };
        });
      },

      // -----------------------------------------------------------------------
      // Remove item from cart
      // -----------------------------------------------------------------------
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((cartItem) => cartItem.item.id !== itemId),
        }));
      },

      // -----------------------------------------------------------------------
      // Update item quantity
      // -----------------------------------------------------------------------
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((cartItem) =>
            cartItem.item.id === itemId
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
      // Clear cart for specific shop
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
      // Get total item count (all shops)
      // -----------------------------------------------------------------------
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // -----------------------------------------------------------------------
      // Get item count for specific shop
      // -----------------------------------------------------------------------
      getShopItemCount: (shopSlug) => {
        return get().items
          .filter((item) => item.shopSlug === shopSlug)
          .reduce((total, item) => total + item.quantity, 0);
      },

      // -----------------------------------------------------------------------
      // Get subtotal (all shops)
      // -----------------------------------------------------------------------
      getSubtotal: () => {
        return get().items.reduce(
          (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
          0
        );
      },

      // -----------------------------------------------------------------------
      // Get subtotal for specific shop
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
      // Get items for specific shop
      // -----------------------------------------------------------------------
      getShopItems: (shopSlug) => {
        return get().items.filter((item) => item.shopSlug === shopSlug);
      },
    }),
    {
      name: 'vestis-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen
    }
  )
);

export default useCartStore;

