"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";

export type CartItem = Pick<Product, "slug" | "name" | "price" | "image" | "weight"> & { quantity: number };
type CartContextValue = { items: CartItem[]; count: number; subtotal: number; addItem: (product: Product) => void; updateQuantity: (slug: string, quantity: number) => void; removeItem: (slug: string) => void; clearCart: () => void };
const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "gbdigimart-cart-v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      localStorage.removeItem(CART_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((product: Product) => setItems((current) => {
    const existing = current.find((item) => item.slug === product.slug);
    return existing ? current.map((item) => item.slug === product.slug ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }];
  }), []);
  const updateQuantity = useCallback((slug: string, quantity: number) => setItems((current) => quantity < 1 ? current.filter((item) => item.slug !== slug) : current.map((item) => item.slug === slug ? { ...item, quantity } : item)), []);
  const removeItem = useCallback((slug: string) => setItems((current) => current.filter((item) => item.slug !== slug)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ items, count: items.reduce((total, item) => total + item.quantity, 0), subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0), addItem, updateQuantity, removeItem, clearCart }), [items, addItem, updateQuantity, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
