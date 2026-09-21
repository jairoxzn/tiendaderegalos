"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "danger" | "info";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = { success: CheckCircle2, danger: XCircle, info: Info };
const iconColors = {
  success: "text-success",
  danger: "text-danger",
  info: "text-info",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...item, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted &&
        createPortal(
          <div className="fixed bottom-5 right-5 z-[100] flex w-full max-w-sm flex-col gap-2.5">
            {toasts.map((t) => {
              const Icon = icons[t.variant];
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3 rounded-[14px] border border-border bg-surface p-4 shadow-[var(--shadow-elevated)] animate-slide-in-bottom"
                >
                  <Icon className={cn("mt-0.5 size-4 shrink-0", iconColors[t.variant])} />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-text-primary">{t.title}</p>
                    {t.description && (
                      <p className="mt-0.5 text-[12.5px] text-text-secondary">{t.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="text-text-secondary hover:text-text-primary"
                    aria-label="Cerrar notificación"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.toast;
}
