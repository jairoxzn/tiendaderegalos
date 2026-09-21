"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, User, Wallet, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useCurrentUser } from "@/components/layout/UserContext";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProductGrid } from "@/components/ui/Skeleton";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/product/ProductImage";
import { CheckoutModal } from "@/features/pos/CheckoutModal";
import { ReceiptModal } from "@/features/pos/ReceiptModal";
import type { ReceiptData } from "@/features/pos/Receipt";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface ProductRow {
  id: string;
  name: string;
  price: string;
  stock: number;
  minStock: number;
  status: "ACTIVO" | "INACTIVO";
  category: { id: string; name: string };
  images: { url: string }[];
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string | null;
}

export default function PosPage() {
  const [registerLoading, setRegisterLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerOption[]>([]);
  const [customer, setCustomer] = useState<CustomerOption | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [storeName, setStoreName] = useState("GiftFlow");

  const toast = useToast();
  const cart = useCart();
  const currentUser = useCurrentUser();

  useEffect(() => {
    fetch("/api/caja")
      .then((res) => res.json())
      .then((data) => setRegisterOpen(!!data))
      .finally(() => setRegisterLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/configuracion")
      .then((res) => res.json())
      .then((data) => setStoreName(data.storeName || "GiftFlow"))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/categorias")
      .then((res) => res.json())
      .then((data) => setCategories(data.filter((c: { active: boolean }) => c.active)));
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    const params = new URLSearchParams({ status: "ACTIVO", pageSize: "60" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("categoryId", categoryFilter);
    fetch(`/api/productos?${params}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.items ?? []))
      .finally(() => setLoadingProducts(false));
  }, [search, categoryFilter]);

  useEffect(() => {
    if (customerQuery.length < 2) {
      setCustomerResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/clientes?pos=true&search=${encodeURIComponent(customerQuery)}`)
        .then((res) => res.json())
        .then(setCustomerResults);
    }, 250);
    return () => clearTimeout(timeout);
  }, [customerQuery]);

  const handleConfirmSale = async (payments: { method: string; amount: number }[]) => {
    setSubmitting(true);
    const { data, error } = await apiRequest<{
      code: string;
      createdAt: string;
      subtotal: string;
      discount: string;
      total: string;
      items: { quantity: number; price: string; total: string; product: { name: string } }[];
      payments: { method: string; amount: string }[];
      customer: { name: string } | null;
    }>("/api/ventas", {
      method: "POST",
      body: JSON.stringify({
        customerId: customer?.id ?? null,
        items: cart.lines.map((l) => ({ productId: l.id, quantity: l.quantity })),
        discount: cart.discount,
        payments,
      }),
    });
    setSubmitting(false);

    if (error) {
      toast({ variant: "danger", title: "No se pudo completar la venta", description: error });
      return;
    }

    if (data) {
      setReceiptData({
        storeName,
        code: data.code,
        createdAt: data.createdAt,
        cashierName: currentUser.name,
        customerName: data.customer?.name,
        items: data.items.map((item) => ({
          quantity: item.quantity,
          name: item.product.name,
          price: Number(item.price),
          total: Number(item.total),
        })),
        subtotal: Number(data.subtotal),
        discount: Number(data.discount),
        total: Number(data.total),
        payments: data.payments.map((p) => ({ method: p.method, amount: Number(p.amount) })),
      });
    }

    cart.clear();
    setCustomer(null);
    setCustomerQuery("");
    setCheckoutOpen(false);

    const params = new URLSearchParams({ status: "ACTIVO", pageSize: "60" });
    if (search) params.set("search", search);
    if (categoryFilter) params.set("categoryId", categoryFilter);
    fetch(`/api/productos?${params}`)
      .then((res) => res.json())
      .then((productsData) => setProducts(productsData.items ?? []));
  };

  if (registerLoading) {
    return <div className="p-8" />;
  }

  if (!registerOpen) {
    return (
      <div className="p-6 sm:p-8">
        <EmptyState
          icon={Wallet}
          title="No hay una caja abierta."
          description="Debes abrir la caja antes de registrar ventas en el POS."
          action={
            <Button onClick={() => (window.location.href = "/caja")}>
              <Wallet className="size-4" />
              Ir a Caja
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Buscar productos por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
              categoryFilter === "" ? "bg-accent text-white" : "bg-bg text-text-secondary hover:text-text-primary",
            )}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                categoryFilter === c.id ? "bg-accent text-white" : "bg-bg text-text-secondary hover:text-text-primary",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loadingProducts ? (
          <SkeletonProductGrid count={12} />
        ) : products.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No se encontraron productos." />
        ) : (
          <ProductGrid>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                  minStock: product.minStock,
                  status: product.status,
                  categoryName: product.category.name,
                  imageUrl: product.images[0]?.url,
                }}
                showStatus={false}
                disabled={product.stock <= 0}
                onClick={() =>
                  cart.addProduct({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    stock: product.stock,
                    imageUrl: product.images[0]?.url,
                  })
                }
              />
            ))}
          </ProductGrid>
        )}
      </div>

      <div className="flex w-full shrink-0 flex-col border-t border-border bg-surface md:h-full md:w-[320px] md:border-l md:border-t-0 lg:w-[380px]">
        <div className="border-b border-border p-4">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-wide text-text-secondary">Cliente</p>
          {customer ? (
            <div className="flex items-center justify-between rounded-[12px] bg-bg px-3 py-2">
              <span className="inline-flex items-center gap-2 text-[13px] font-medium text-text-primary">
                <User className="size-4 text-text-secondary" />
                {customer.name}
              </span>
              <button onClick={() => setCustomer(null)} aria-label="Quitar cliente">
                <X className="size-4 text-text-secondary hover:text-text-primary" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <SearchInput
                placeholder="Cliente general (opcional)"
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
              />
              {customerResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-[12px] border border-border bg-surface p-1.5 shadow-[var(--shadow-elevated)]">
                  {customerResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomer(c);
                        setCustomerQuery("");
                        setCustomerResults([]);
                      }}
                      className="flex w-full flex-col rounded-[10px] px-3 py-2 text-left hover:bg-bg"
                    >
                      <span className="text-[13px] font-medium text-text-primary">{c.name}</span>
                      {c.phone && <span className="text-[12px] text-text-secondary">{c.phone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.lines.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Carrito vacío" description="Toca un producto para agregarlo." />
          ) : (
            <div className="space-y-3">
              {cart.lines.map((line) => (
                <div key={line.id} className="flex items-center gap-3">
                  <ProductImage src={line.imageUrl} alt={line.name} className="size-12 shrink-0" sizes="48px" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-text-primary">{line.name}</p>
                    <p className="text-[12px] text-text-secondary">{formatCurrency(line.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="icon"
                      size="iconSm"
                      onClick={() => cart.setQuantity(line.id, line.quantity - 1)}
                      aria-label="Restar"
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-5 text-center text-[13px] font-medium">{line.quantity}</span>
                    <Button
                      variant="icon"
                      size="iconSm"
                      onClick={() => cart.setQuantity(line.id, line.quantity + 1)}
                      disabled={line.quantity >= line.stock}
                      aria-label="Sumar"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    variant="icon"
                    size="iconSm"
                    className="hover:text-danger"
                    onClick={() => cart.removeLine(line.id)}
                    aria-label="Quitar"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-border p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-text-secondary">Subtotal</span>
            <span className="font-medium text-text-primary">{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-text-secondary">Descuento</span>
            <input
              type="number"
              min={0}
              max={cart.subtotal}
              step="0.01"
              value={cart.discount || ""}
              onChange={(e) => cart.setDiscount(Math.max(0, Number(e.target.value) || 0))}
              placeholder="0.00"
              className="w-24 rounded-[10px] border border-border bg-surface px-2.5 py-1 text-right text-[13px] outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-[15px] font-semibold">
            <span className="text-text-primary">Total</span>
            <span className="text-text-primary">{formatCurrency(cart.total)}</span>
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={cart.lines.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Cobrar
          </Button>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={cart.total}
        loading={submitting}
        onConfirm={handleConfirmSale}
      />

      <ReceiptModal open={!!receiptData} onClose={() => setReceiptData(null)} data={receiptData} />
    </div>
  );
}
