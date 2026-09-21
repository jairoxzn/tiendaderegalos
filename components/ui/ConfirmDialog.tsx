"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (result: boolean) => {
    resolver?.(result);
    setOptions(null);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        open={!!options}
        onClose={() => handleClose(false)}
        title={options?.title}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => handleClose(false)}>
              {options?.cancelLabel ?? "Cancelar"}
            </Button>
            <Button variant={options?.danger ? "danger" : "primary"} onClick={() => handleClose(true)}>
              {options?.confirmLabel ?? "Confirmar"}
            </Button>
          </>
        }
      >
        {options?.description && <p className="text-sm text-text-secondary">{options.description}</p>}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx.confirm;
}
