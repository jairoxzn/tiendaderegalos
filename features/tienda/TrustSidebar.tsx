import { ShieldCheck, Headphones, Gift } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Compra segura", description: "Coordinamos tu pedido directo por WhatsApp." },
  { icon: Headphones, title: "Atención personalizada", description: "Te ayudamos en todo momento." },
  { icon: Gift, title: "Variedad de productos", description: "Los mejores regalos en un solo lugar." },
];

export function TrustSidebar() {
  return (
    <aside className="flex w-full flex-col gap-4 lg:w-[260px] lg:shrink-0">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <item.icon className="size-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-text-primary">{item.title}</p>
                <p className="text-[12px] text-text-secondary">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br from-[#c026d3] to-accent p-6 text-white">
        <Gift className="absolute -bottom-3 -right-3 size-20 text-white/15" />
        <p className="relative text-[15px] font-bold leading-snug">Porque cada detalle cuenta</p>
      </div>
    </aside>
  );
}
