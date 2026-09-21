"use client";

import { useEffect, useState } from "react";
import { Banknote, CreditCard, Landmark, Plus, Smartphone, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { salePaymentMethods } from "@/schemas/sale";

type PaymentMethod = (typeof salePaymentMethods)[number];

interface PaymentRow {
  method: PaymentMethod;
  amount: number;
}

const methodMeta: Record<PaymentMethod, { label: string; icon: typeof Banknote }> = {
  EFECTIVO: { label: "Efectivo", icon: Banknote },
  YAPE: { label: "Yape", icon: Smartphone },
  PLIN: { label: "Plin", icon: Smartphone },
  TARJETA: { label: "Tarjeta", icon: CreditCard },
  TRANSFERENCIA: { label: "Transferencia", icon: Landmark },
};

const methodOptions = Object.entries(methodMeta).map(([value, meta]) => ({ value, label: meta.label }));

export function CheckoutModal({
  open,
  onClose,
  total,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  onConfirm: (payments: PaymentRow[]) => void;
  loading: boolean;
}) {
  const [mixed, setMixed] = useState(false);
  const [singleMethod, setSingleMethod] = useState<PaymentMethod>("EFECTIVO");
  const [rows, setRows] = useState<PaymentRow[]>([{ method: "EFECTIVO", amount: total }]);

  useEffect(() => {
    if (open) {
      setMixed(false);
      setSingleMethod("EFECTIVO");
      setRows([{ method: "EFECTIVO", amount: total }]);
    }
  }, [open, total]);

  const paid = rows.reduce((sum, r) => sum + (Number.isFinite(r.amount) ? r.amount : 0), 0);
  const remaining = total - paid;

  const updateRow = (index: number, patch: Partial<PaymentRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { method: "EFECTIVO", amount: Math.max(0, remaining) }]);
  };

  const canConfirm = mixed ? Math.abs(remaining) < 0.01 && rows.length > 0 : true;

  const handleConfirm = () => {
    if (mixed) {
      onConfirm(rows.filter((r) => r.amount > 0));
    } else {
      onConfirm([{ method: singleMethod, amount: total }]);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cobrar"
      description={`Total a pagar: ${formatCurrency(total)}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={loading} disabled={!canConfirm}>
            Confirmar venta
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-1 rounded-[12px] bg-bg p-1">
          <button
            onClick={() => setMixed(false)}
            className={cn(
              "flex-1 rounded-[10px] py-2 text-[13px] font-medium transition-all",
              !mixed ? "bg-surface text-text-primary shadow-[var(--shadow-soft)]" : "text-text-secondary",
            )}
          >
            Un método
          </button>
          <button
            onClick={() => setMixed(true)}
            className={cn(
              "flex-1 rounded-[10px] py-2 text-[13px] font-medium transition-all",
              mixed ? "bg-surface text-text-primary shadow-[var(--shadow-soft)]" : "text-text-secondary",
            )}
          >
            Pago mixto
          </button>
        </div>

        {!mixed ? (
          <div className="grid grid-cols-3 gap-2">
            {methodOptions.map((opt) => {
              const Icon = methodMeta[opt.value as PaymentMethod].icon;
              const active = singleMethod === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setSingleMethod(opt.value as PaymentMethod)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-[14px] border p-4 text-[12.5px] font-medium transition-all",
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-text-secondary hover:border-text-secondary/40",
                  )}
                >
                  <Icon className="size-5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2">
                <Select
                  label={index === 0 ? "Método" : undefined}
                  options={methodOptions}
                  value={row.method}
                  onChange={(e) => updateRow(index, { method: e.target.value as PaymentMethod })}
                  className="min-w-[140px] flex-1"
                />
                <Input
                  label={index === 0 ? "Monto (S/)" : undefined}
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.amount}
                  onChange={(e) => updateRow(index, { amount: Number(e.target.value) })}
                  className="w-28 shrink-0"
                />
                {rows.length > 1 && (
                  <Button
                    variant="icon"
                    size="iconMd"
                    className="shrink-0 hover:text-danger"
                    onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                    aria-label="Quitar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={addRow} className="self-start">
              <Plus className="size-4" />
              Agregar método
            </Button>
            <div
              className={cn(
                "flex items-center justify-between rounded-[12px] px-3.5 py-2.5 text-[13px] font-medium",
                Math.abs(remaining) < 0.01 ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
              )}
            >
              <span>Pagado: {formatCurrency(paid)}</span>
              <span>{Math.abs(remaining) < 0.01 ? "Completo" : `Falta ${formatCurrency(remaining)}`}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
