'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from './types';

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
  comboItems?: { productId: string; name: string; image?: string; quantity: number }[];
}

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  couponCode: string | null;
  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addRecentlyViewed: (productId: string) => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      recentlyViewed: [],
      couponCode: null,

      addToCart: (product, size, color, qty = 1) =>
        set((state) => {
          const sizePrice = product.sizes.find((s) => s.name === size);
          const price = sizePrice?.price ?? product.price;
          const compareAtPrice = sizePrice?.compareAtPrice ?? product.compareAtPrice;
          const existing = state.cart.find(
            (i) => i.productId === product.id && i.size === size && i.color === color
          );
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i === existing ? { ...i, quantity: Math.min(i.quantity + qty, i.maxStock) } : i
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price,
                compareAtPrice,
                image: product.images[0]?.url ?? '',
                size,
                color,
                quantity: Math.min(qty, product.stock),
                maxStock: product.stock,
                comboItems: product.comboItems,
              },
            ],
          };
        }),

      removeFromCart: (productId, size, color) =>
        set((state) => ({
          cart: state.cart.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        })),

      updateQuantity: (productId, size, color, qty) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) }
              : i
          ),
        })),

      clearCart: () => set({ cart: [], couponCode: null }),

      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),

      isInWishlist: (productId) => get().wishlist.includes(productId),

      addRecentlyViewed: (productId) =>
        set((state) => ({
          recentlyViewed: [productId, ...state.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
        })),

      applyCoupon: (code) => set({ couponCode: code }),
      removeCoupon: () => set({ couponCode: null }),
    }),
    { name: 'maison-noir-store', storage: createJSONStorage(() => localStorage) }
  )
);

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}
