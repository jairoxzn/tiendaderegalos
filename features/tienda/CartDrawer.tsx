"use client";

import { Minus, Plus, ShoppingCart, Trash2, MessageCircle } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/product/ProductImage";
import { formatCurrency } from "@/lib/currency";
import type { CartLine } from "@/hooks/useLocalCart";

export function CartDrawer({
  open,
  onClose,
  lines,
  total,
  setQuantity,
  remove,
  whatsappNumber,
  storeName,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  total: number;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  whatsappNumber: string | null | undefined;
  storeName: string;
}) {
  const buildWhatsappLink = () => {
    const number = (whatsappNumber || "").replace(/\D/g, "");
    const itemLines = lines.map((l) => `• ${l.quantity}x ${l.name} — ${formatCurrency(l.price * l.quantity)}`);
    const text = [
      `Hola ${storeName}, quiero hacer este pedido:`,
      "",
      ...itemLines,
      "",
      `Total: ${formatCurrency(total)}`,
    ].join("\n");
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  };

  return (
    <Drawer open={open} onClose={onClose} title="Tu carrito" width="380px">
      {lines.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Tu carrito está vacío" description="Agrega productos para armar tu pedido." />
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto">
            {lines.map((line) => (
              <div key={line.id} className="flex items-center gap-3">
                <ProductImage src={line.imageUrl} alt={line.name} className="size-14 shrink-0" sizes="56px" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text-primary">{line.name}</p>
                  <p className="text-[12px] text-text-secondary">{formatCurrency(line.price)} c/u</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <button
                      onClick={() => setQuantity(line.id, line.quantity - 1)}
                      className="flex size-6 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-bg"
                      aria-label="Restar"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-5 text-center text-[13px] font-medium">{line.quantity}</span>
                    <button
                      onClick={() => setQuantity(line.id, line.quantity + 1)}
                      className="flex size-6 items-center justify-center rounded-full border border-border text-text-secondary hover:bg-bg"
                      aria-label="Sumar"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => remove(line.id)}
                  className="text-text-secondary hover:text-danger"
                  aria-label="Quitar"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-4 border-t border-border pt-4">
            <div className="flex items-center justify-between text-[15px] font-semibold">
              <span className="text-text-primary">Total</span>
              <span className="text-text-primary">{formatCurrency(total)}</span>
            </div>
            <a href={buildWhatsappLink()} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-success hover:bg-success" size="lg">
                <MessageCircle className="size-4" />
                Pedir por WhatsApp
              </Button>
            </a>
            <p className="text-center text-[11.5px] text-text-secondary">
              Te atenderemos directamente por WhatsApp para coordinar el pago y la entrega.
            </p>
          </div>
        </div>
      )}
    </Drawer>
  );
}
