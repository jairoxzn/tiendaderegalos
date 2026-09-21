"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1 && !totalItems) return null;

  const from = totalItems && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const to = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : undefined;

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-2">
      <p className="text-[13px] text-text-secondary">
        {totalItems !== undefined ? (
          <>
            Mostrando <span className="font-medium text-text-primary">{from}-{to}</span> de{" "}
            <span className="font-medium text-text-primary">{totalItems}</span>
          </>
        ) : (
          `Página ${page} de ${totalPages}`
        )}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-[3rem] text-center text-[13px] font-medium text-text-primary">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
