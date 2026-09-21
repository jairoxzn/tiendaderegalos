"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Receipt, type ReceiptData } from "@/features/pos/Receipt";

export function ReceiptModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: ReceiptData | null;
}) {
  useEffect(() => {
    const handleAfterPrint = () => document.body.classList.remove("printing-receipt");
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  const handlePrint = () => {
    document.body.classList.add("printing-receipt");
    window.print();
  };

  if (!data) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Venta registrada"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="no-print">
            Cerrar
          </Button>
          <Button onClick={handlePrint} className="no-print">
            <Printer className="size-4" />
            Imprimir
          </Button>
        </>
      }
    >
      <div className="rounded-[14px] border border-border bg-bg p-2">
        <Receipt data={data} />
      </div>
    </Modal>
  );
}
