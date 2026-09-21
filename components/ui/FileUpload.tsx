"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  className?: string;
  aspect?: "square" | "video";
}

export function FileUpload({ value, onChange, label, hint, className, aspect = "square" }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "danger", title: "No se pudo subir la imagen", description: data.error });
        return;
      }
      onChange(data.url);
    } catch {
      toast({ variant: "danger", title: "No se pudo subir la imagen", description: "Inténtalo nuevamente." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-[13px] font-medium text-text-primary">{label}</label>}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) upload(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-dashed border-border bg-bg transition-colors hover:border-accent",
          aspect === "square" ? "aspect-square w-full max-w-[220px]" : "aspect-video w-full",
          dragOver && "border-accent bg-accent-soft",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        {value ? (
          <>
            <Image src={value} alt="Imagen subida" fill className="object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Quitar imagen"
            >
              <X className="size-3.5" />
            </button>
          </>
        ) : uploading ? (
          <Loader2 className="size-6 animate-spin text-text-secondary" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <ImagePlus className="size-6 text-text-secondary" />
            <p className="text-[12.5px] text-text-secondary">Arrastra una imagen o haz clic</p>
          </div>
        )}
      </div>
      {hint && <p className="text-[12px] text-text-secondary">{hint}</p>}
    </div>
  );
}
