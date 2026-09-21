"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-elevated)] animate-scale-in max-h-[85vh] flex flex-col",
          sizeClasses[size],
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border p-6">
            <div>
              {title && <h2 className="text-[17px] font-semibold text-text-primary">{title}</h2>}
              {description && <p className="mt-1 text-[13px] text-text-secondary">{description}</p>}
            </div>
            <Button variant="icon" size="iconSm" onClick={onClose} aria-label="Cerrar">
              <X className="size-4" />
            </Button>
          </div>
        )}
        <div className="overflow-y-auto p-6">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-border p-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
