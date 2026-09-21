import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  className,
  sizes,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[12px] bg-bg", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes ?? "200px"} className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-secondary/50">
          <ImageOff className="size-6" />
        </div>
      )}
    </div>
  );
}
