"use client";

import { Gift, Heart, ShoppingCart, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product/ProductImage";

export function StorefrontHeader({
  storeName,
  logoUrl,
  search,
  onSearchChange,
  favoritesCount,
  favoritesActive,
  onToggleFavoritesView,
  cartCount,
  onOpenCart,
}: {
  storeName: string;
  logoUrl?: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  favoritesCount: number;
  favoritesActive: boolean;
  onToggleFavoritesView: () => void;
  cartCount: number;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-accent text-white">
            {logoUrl ? (
              <ProductImage src={logoUrl} alt={storeName} className="size-10 rounded-[12px]" sizes="40px" />
            ) : (
              <Gift className="size-5" />
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-[17px] font-semibold leading-tight tracking-tight text-text-primary">{storeName}</p>
            <p className="text-[11.5px] leading-tight text-text-secondary">Regalos que conectan</p>
          </div>
        </div>

        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos o categorías..."
            className="h-11 w-full rounded-full border border-border bg-bg px-11 text-[13.5px] text-text-primary outline-none focus:border-accent focus:bg-surface"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={onToggleFavoritesView}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
              favoritesActive ? "bg-accent-soft text-accent" : "text-text-secondary hover:bg-bg hover:text-text-primary",
            )}
          >
            <Heart className={cn("size-[18px]", favoritesActive && "fill-accent")} />
            <span className="hidden sm:inline">Favoritos</span>
            {favoritesCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-bg hover:text-text-primary"
          >
            <ShoppingCart className="size-[18px]" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-5 pb-3 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar productos..."
            className="h-10 w-full rounded-full border border-border bg-bg px-11 text-[13.5px] text-text-primary outline-none focus:border-accent focus:bg-surface"
          />
        </div>
      </div>
    </header>
  );
}
