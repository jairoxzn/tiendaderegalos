"use client";

import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/category-icons";
import type { StorefrontCategory } from "@/features/tienda/types";

export function CategoryNav({
  categories,
  activeId,
  onSelect,
}: {
  categories: StorefrontCategory[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <nav className="scrollbar-hide border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex shrink-0 flex-col items-center gap-1.5 rounded-[14px] px-3.5 py-2 text-[12px] font-medium transition-colors",
            activeId === null ? "bg-accent text-white" : "text-text-secondary hover:bg-bg",
          )}
        >
          <LayoutGrid className="size-[18px]" />
          Todas
        </button>
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const active = activeId === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1.5 rounded-[14px] px-3.5 py-2 text-[12px] font-medium transition-colors",
                active ? "bg-accent text-white" : "text-text-secondary hover:bg-bg",
              )}
            >
              <Icon className="size-[18px]" />
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
