"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

/** Fetches and refreshes a JSON array resource, with toast-based error reporting. */
export function useCrudList<T>(path: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(path);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cargar la información.");
      setItems(data);
    } catch (error) {
      toast({
        variant: "danger",
        title: "Error al cargar",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [path, toast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, setItems, loading, refresh };
}

export async function apiRequest<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { data: null, error: data?.error || "Ocurrió un error inesperado." };
    }
    return { data, error: null };
  } catch {
    return { data: null, error: "No se pudo conectar con el servidor." };
  }
}
