"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  width?: string;
  contentClassName?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  width = "360px",
  contentClassName = "p-5",
}: DrawerProps) {
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
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 flex h-full flex-col bg-surface shadow-[var(--shadow-elevated)]",
          side === "right" ? "ml-auto animate-slide-in-right" : "animate-slide-in-left",
        )}
        style={{ width }}
      >
        {title && (
          <div className="flex items-center justify-between gap-4 border-b border-border p-5">
            <h2 className="text-[15px] font-semibold text-text-primary">{title}</h2>
            <Button variant="icon" size="iconSm" onClick={onClose} aria-label="Cerrar" className="ml-auto">
              <X className="size-4" />
            </Button>
          </div>
        )}
        <div className={cn("flex-1 overflow-y-auto", contentClassName)}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
