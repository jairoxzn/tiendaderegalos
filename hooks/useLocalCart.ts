"use client";

import { useCallback, useEffect, useState } from "react";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}

const STORAGE_KEY = "giftflow:tienda-cart";

export function useLocalCart() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore — private browsing / storage unavailable
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore
    }
  }, [lines, hydrated]);

  const add = useCallback((product: Omit<CartLine, "quantity">) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === product.id);
      if (existing) {
        return prev.map((l) => (l.id === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity: Math.max(0, quantity) } : l)).filter((l) => l.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  return { lines, add, setQuantity, remove, clear, count, total };
}
