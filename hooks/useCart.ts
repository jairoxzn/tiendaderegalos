"use client";

import { useMemo, useState } from "react";

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
}

export interface CartLine extends CartProduct {
  quantity: number;
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);

  const addProduct = (product: CartProduct) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((l) => (l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const setQuantity = (productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.id === productId ? { ...l, quantity: Math.max(0, Math.min(quantity, l.stock)) } : l))
        .filter((l) => l.quantity > 0),
    );
  };

  const removeLine = (productId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== productId));
  };

  const clear = () => {
    setLines([]);
    setDiscount(0);
  };

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.price * l.quantity, 0), [lines]);
  const total = Math.max(0, subtotal - discount);

  return { lines, addProduct, setQuantity, removeLine, clear, discount, setDiscount, subtotal, total };
}
