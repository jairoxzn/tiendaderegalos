import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function ProductPrice({ price, cost, className }: { price: number | string; cost?: number | string; className?: string }) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-[15px] font-semibold text-text-primary">{formatCurrency(price)}</span>
      {cost !== undefined && (
        <span className="text-[12px] text-text-secondary">costo {formatCurrency(cost)}</span>
      )}
    </div>
  );
}
