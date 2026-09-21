import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductStatus } from "@/components/product/ProductStatus";

export interface ProductCardProduct {
  id: string;
  name: string;
  price: number | string;
  cost?: number | string;
  stock: number;
  minStock: number;
  status: "ACTIVO" | "INACTIVO";
  categoryName?: string;
  imageUrl?: string | null;
}

export function ProductCard({
  product,
  onClick,
  disabled,
  showStatus = true,
  actions,
}: {
  product: ProductCardProduct;
  onClick?: () => void;
  disabled?: boolean;
  showStatus?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "group flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-3 transition-all",
        onClick && !disabled && "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <div className="relative">
        <ProductImage src={product.imageUrl} alt={product.name} className="aspect-square w-full" sizes="220px" />
        {showStatus && (
          <div className="absolute left-2 top-2">
            <ProductStatus status={product.status} stock={product.stock} minStock={product.minStock} />
          </div>
        )}
      </div>
      <div>
        {product.categoryName && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-text-secondary">{product.categoryName}</p>
        )}
        <p className="mt-0.5 line-clamp-1 text-[13.5px] font-semibold text-text-primary">{product.name}</p>
        <div className="mt-1.5 flex items-center justify-between">
          <ProductPrice price={product.price} />
          <span className="text-[12px] text-text-secondary">Stock: {product.stock}</span>
        </div>
      </div>
      {actions}
    </div>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{children}</div>;
}
