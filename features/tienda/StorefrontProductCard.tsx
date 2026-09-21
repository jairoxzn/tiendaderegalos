"use client";

import { Heart, ShoppingCart, Check } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product/ProductImage";
import type { StorefrontProduct } from "@/features/tienda/types";

export function StorefrontProductCard({
  product,
  favorite,
  onToggleFavorite,
  onAddToCart,
  justAdded,
}: {
  product: StorefrontProduct;
  favorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  justAdded: boolean;
}) {
  const hasDiscount = product.compareAtPrice !== null && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="relative">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full rounded-none"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white">
              -{discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[11px] font-semibold text-white">
              Más vendido
            </span>
          )}
          {!hasDiscount && !product.isBestSeller && product.isNew && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">Nuevo</span>
          )}
        </div>
        <button
          onClick={onToggleFavorite}
          aria-label={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-white/90 text-text-secondary shadow-sm backdrop-blur-sm transition-colors hover:text-accent"
        >
          <Heart className={cn("size-4", favorite && "fill-accent text-accent")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        {product.categoryName && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">{product.categoryName}</p>
        )}
        <p className="mt-0.5 line-clamp-2 flex-1 text-[13.5px] font-medium text-text-primary">{product.name}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[16px] font-semibold text-text-primary">{formatCurrency(product.price)}</span>
          {hasDiscount && (
            <span className="text-[12.5px] text-text-secondary line-through">
              {formatCurrency(product.compareAtPrice as number)}
            </span>
          )}
        </div>

        <button
          onClick={onAddToCart}
          disabled={outOfStock}
          className={cn(
            "mt-3 flex items-center justify-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[12.5px] font-semibold transition-all",
            outOfStock
              ? "cursor-not-allowed bg-bg text-text-secondary"
              : justAdded
                ? "bg-success text-white"
                : "bg-accent text-white hover:bg-accent-hover",
          )}
        >
          {outOfStock ? (
            "Agotado"
          ) : justAdded ? (
            <>
              <Check className="size-3.5" />
              Agregado
            </>
          ) : (
            <>
              <ShoppingCart className="size-3.5" />
              Agregar al carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
}
