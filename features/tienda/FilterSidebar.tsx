"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { StorefrontCategory } from "@/features/tienda/types";

export type SortOption = "recientes" | "precio-asc" | "precio-desc" | "nombre";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre (A-Z)" },
];

export function FilterSidebar({
  categories,
  selectedCategoryIds,
  onToggleCategory,
  maxPrice,
  priceLimit,
  onPriceLimitChange,
  sort,
  onSortChange,
  onClear,
}: {
  categories: StorefrontCategory[];
  selectedCategoryIds: string[];
  onToggleCategory: (id: string) => void;
  maxPrice: number;
  priceLimit: number;
  onPriceLimitChange: (value: number) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onClear: () => void;
}) {
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[240px] lg:shrink-0">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-text-primary" />
        <h2 className="text-[14px] font-semibold text-text-primary">Filtrar productos</h2>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-text-primary">Categorías</h3>
        <div className="space-y-2.5">
          {categories.map((category) => (
            <label key={category.id} className="flex cursor-pointer items-center justify-between gap-2">
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => onToggleCategory(category.id)}
                  className="size-4 rounded border-border accent-[color:var(--color-accent)]"
                />
                <span className="text-[13px] text-text-primary">{category.name}</span>
              </span>
              <span className="text-[12px] text-text-secondary">{category.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-text-primary">Precio</h3>
        <input
          type="range"
          min={0}
          max={maxPrice}
          step={Math.max(1, Math.round(maxPrice / 50))}
          value={priceLimit}
          onChange={(e) => onPriceLimitChange(Number(e.target.value))}
          className="w-full accent-[color:var(--color-accent)]"
        />
        <div className="mt-1.5 flex items-center justify-between text-[12px] text-text-secondary">
          <span>S/ 0</span>
          <span>{priceLimit >= maxPrice ? `${formatCurrency(maxPrice)}+` : formatCurrency(priceLimit)}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[13px] font-semibold text-text-primary">Ordenar por</h3>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="h-10 w-full rounded-[var(--radius-control)] border border-border bg-surface px-3 text-[13px] text-text-primary outline-none focus:border-accent"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onClear}
        className="flex items-center gap-1.5 self-start text-[13px] font-medium text-accent hover:text-accent-hover"
      >
        <RotateCcw className="size-3.5" />
        Limpiar filtros
      </button>
    </aside>
  );
}
