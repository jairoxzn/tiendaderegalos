"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Share2, Copy, Check, QrCode, Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export function ShareCatalogPanel({ url, storeName }: { url: string; storeName: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  if (dismissed) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ variant: "success", title: "Enlace copiado" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "danger", title: "No se pudo copiar el enlace" });
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Catálogo de ${storeName}`, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      copyLink();
    }
  };

  const downloadQr = () => {
    const canvas = canvasWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "catalogo-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <>
      <div className="no-print border-b border-border bg-accent-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
          <p className="text-[13px] font-medium text-accent">Comparte tu catálogo con tus clientes</p>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-1.5">
              <span className="max-w-[220px] truncate text-[12.5px] text-text-secondary sm:max-w-xs">{url}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={copyLink}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copiar enlace
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setQrOpen(true)}>
              <QrCode className="size-3.5" />
              Código QR
            </Button>
            <Button size="sm" onClick={share}>
              <Share2 className="size-3.5" />
              Compartir
            </Button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Ocultar"
              className="flex size-8 items-center justify-center rounded-full text-accent/70 hover:bg-white/40 hover:text-accent"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Código QR del catálogo"
        description="Imprímelo o compártelo para que tus clientes accedan directamente."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setQrOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={downloadQr}>
              <Download className="size-4" />
              Descargar PNG
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4">
          <div ref={canvasWrapperRef} className="rounded-[16px] border border-border p-4">
            <QRCodeCanvas value={url} size={220} level="M" marginSize={0} />
          </div>
          <p className="text-center text-[12.5px] text-text-secondary">{url}</p>
        </div>
      </Modal>
    </>
  );
}
