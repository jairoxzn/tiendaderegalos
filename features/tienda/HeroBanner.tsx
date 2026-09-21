import { Gift, Truck, MapPin, Sparkles } from "lucide-react";

export function HeroBanner({ storeName, address }: { storeName: string; address?: string | null }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-5 py-6 lg:grid-cols-[1fr_320px]">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-accent via-[#ff5c85] to-[#c026d3] px-8 py-10 sm:px-12 sm:py-14">
        <div className="absolute -right-10 -top-10 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 right-24 size-48 rounded-full bg-white/10 blur-2xl" />
        <Sparkles className="absolute right-10 top-10 size-8 text-white/40" />
        <Gift className="absolute bottom-8 right-16 size-16 text-white/20" />

        <div className="relative max-w-md">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[36px]">
            Los mejores regalos para <span className="text-white/90">cada ocasión</span>
          </h1>
          <p className="mt-3 text-[14px] text-white/85">
            Peluches, flores, chocolates y mucho más… ¡Haz que cada momento con {storeName} sea especial!
          </p>
          <a
            href="#catalogo-productos"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13.5px] font-semibold text-accent shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Gift className="size-4" />
            Ver catálogo
          </a>
        </div>
      </div>

      <div className="relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1d1d1f] to-[#3a1d3f] p-6 text-white">
        <Truck className="absolute -bottom-4 -right-4 size-24 text-white/10" />
        <div className="relative">
          <p className="text-[18px] font-bold leading-tight">Envíos a todo el Perú</p>
          <p className="mt-1.5 text-[12.5px] text-white/75">Llevamos tus regalos hasta donde estés.</p>
        </div>
        {address && (
          <p className="relative mt-4 flex items-center gap-1.5 text-[12px] text-white/70">
            <MapPin className="size-3.5 shrink-0" />
            {address}
          </p>
        )}
      </div>
    </div>
  );
}
