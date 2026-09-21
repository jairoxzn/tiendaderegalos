import { formatCurrency } from "@/lib/currency";
import { numeroALetras } from "@/lib/numero-a-letras";
import { cn } from "@/lib/utils";

const paymentMethodLabels: Record<string, string> = {
  EFECTIVO: "EFECTIVO",
  YAPE: "YAPE",
  PLIN: "PLIN",
  TARJETA: "TARJETA",
  TRANSFERENCIA: "TRANSFERENCIA",
};

export interface ReceiptData {
  storeName: string;
  code: string;
  createdAt: string | Date;
  cashierName: string;
  customerName?: string | null;
  items: { quantity: number; name: string; price: number; total: number }[];
  subtotal: number;
  discount: number;
  total: number;
  payments: { method: string; amount: number }[];
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-3", bold && "font-bold")}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Divider({ dashed }: { dashed?: boolean }) {
  return <div className={cn("my-1.5 border-t", dashed ? "border-dashed" : "border-solid")} style={{ borderColor: "#000" }} />;
}

export function Receipt({ data, className }: { data: ReceiptData; className?: string }) {
  const date = new Date(data.createdAt);

  return (
    <div
      className={cn(
        "print-receipt mx-auto w-full max-w-[320px] bg-white p-5 font-mono text-[12px] leading-tight text-black",
        className,
      )}
    >
      <div className="text-center">
        <p className="text-[15px] font-bold uppercase">{data.storeName}</p>
        <p className="mt-1 font-bold">NOTA DE CONSUMO</p>
        <p className="text-[11px]">{data.code}</p>
      </div>

      <Divider />

      <Row label="FECHA:" value={date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })} />
      <Row label="HORA:" value={date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true })} />
      {data.customerName && <Row label="CLIENTE:" value={data.customerName.toUpperCase()} />}
      <Row label="ATENDIDO:" value={data.cashierName.toUpperCase()} />

      <Divider dashed />

      <div className="flex justify-between font-bold">
        <span>DESCRIPCION</span>
        <span>TOTAL</span>
      </div>

      <Divider dashed />

      <div className="space-y-1.5">
        {data.items.map((item, index) => (
          <div key={index}>
            <p>
              {item.quantity} x {item.name}
            </p>
            <div className="flex justify-between pl-3 text-[11.5px]">
              <span>{formatCurrency(item.price)} c/u</span>
              <span className="font-semibold">{formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>

      <Divider dashed />

      <Row label="SUBTOTAL:" value={formatCurrency(data.subtotal)} />
      {data.discount > 0 && <Row label="DESCUENTO:" value={`-${formatCurrency(data.discount)}`} />}
      <div className="mt-1 flex justify-between text-[14px] font-bold">
        <span>TOTAL:</span>
        <span>{formatCurrency(data.total)}</span>
      </div>

      <Divider dashed />

      <p className="text-center text-[11px]">{numeroALetras(data.total)}</p>

      <Divider dashed />

      <p className="text-center">
        {data.payments.map((p) => `${paymentMethodLabels[p.method] ?? p.method} S/ ${p.amount.toFixed(2)}`).join(" · ")}
      </p>

      <Divider />

      <p className="text-center italic">¡Gracias por su preferencia!</p>
      <p className="mt-2 text-center text-[10px] text-gray-500">Documento sin valor tributario</p>
      <p className="text-center text-[10px] text-gray-500">No válido como comprobante de pago</p>
    </div>
  );
}
