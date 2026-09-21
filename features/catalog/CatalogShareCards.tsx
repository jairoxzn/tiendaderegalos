"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { QrCode, Copy, Check, Share2, Download, ExternalLink, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function CatalogShareCards({ url, storeName }: { url: string; storeName: string }) {
  const [copied, setCopied] = useState(false);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="flex flex-col items-center pt-6 text-center">
          <div className="mb-4 flex items-center gap-2 self-start">
            <QrCode className="size-[18px] text-text-primary" />
            <h2 className="text-[15px] font-semibold text-text-primary">Código QR del catálogo</h2>
          </div>
          <div ref={canvasWrapperRef} className="rounded-[16px] border border-border p-4">
            <QRCodeCanvas value={url} size={220} level="M" marginSize={0} />
          </div>
          <Button className="mt-5 w-full" onClick={downloadQr}>
            <Download className="size-4" />
            Descargar QR (PNG)
          </Button>
          <p className="mt-4 text-[12.5px] text-text-secondary">
            Imprímelo en tu local o compártelo por WhatsApp/redes. Al escanearlo, tus clientes verán el catálogo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-2 text-[15px] font-semibold text-text-primary">Enlace público</h2>
          <p className="mb-4 text-[13px] text-text-secondary">
            Cualquiera con este enlace puede ver el catálogo (sin necesidad de iniciar sesión).
          </p>

          <div className="mb-4 flex items-center justify-between gap-2 rounded-[10px] bg-bg px-3.5 py-2.5">
            <span className="truncate text-[13px] text-text-primary">{url}</span>
            <button
              onClick={copyLink}
              aria-label="Copiar enlace"
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface hover:text-text-primary"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                <ExternalLink className="size-3.5" />
                Abrir catálogo
              </Button>
            </a>
            <Button variant="secondary" size="sm" onClick={copyLink}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              Copiar enlace
            </Button>
            <Button size="sm" onClick={share}>
              <Share2 className="size-3.5" />
              Compartir
            </Button>
          </div>

          <div className="flex items-start gap-3 rounded-[14px] border border-info/20 bg-info-soft p-4">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-info" />
            <p className="text-[13px] text-text-primary/90">
              <span className="font-semibold">Consejo:</span> el catálogo muestra el nombre, imagen y precio de tus
              productos activos. Sube imágenes desde{" "}
              <Link href="/productos" className="font-semibold text-accent underline">
                Productos
              </Link>{" "}
              y personaliza tu logo/datos en{" "}
              <Link href="/configuracion" className="font-semibold text-accent underline">
                Configuración
              </Link>{" "}
              para que se vea profesional.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
