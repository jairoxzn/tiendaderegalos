import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Wallet, ShoppingBag, Calendar } from "lucide-react";
import { getCustomer } from "@/services/customers";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  return (
    <div className="p-6 sm:p-8">
      <Link href="/clientes" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary">
        <ArrowLeft className="size-3.5" />
        Volver a clientes
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">{customer.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-text-secondary">
            {customer.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" /> {customer.phone}
              </span>
            )}
            {customer.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" /> {customer.email}
              </span>
            )}
            {customer.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {customer.address}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <ShoppingBag className="size-4" /> Total de compras
            </div>
            <p className="mt-2 text-[24px] font-semibold text-text-primary">{customer.stats.totalPurchases}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <Wallet className="size-4" /> Total gastado
            </div>
            <p className="mt-2 text-[24px] font-semibold text-text-primary">{formatCurrency(Number(customer.stats.totalSpent))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <Calendar className="size-4" /> Última compra
            </div>
            <p className="mt-2 text-[15px] font-semibold text-text-primary">
              {customer.stats.lastPurchase
                ? new Date(customer.stats.lastPurchase).toLocaleDateString("es-PE", { dateStyle: "medium" })
                : "Sin compras"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Historial de ventas</h2>
          {customer.sales.length === 0 ? (
            <EmptyState title="Sin ventas registradas." />
          ) : (
            <div className="space-y-2">
              {customer.sales.map((sale) => (
                <Card key={sale.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{sale.code}</p>
                      <p className="text-[12px] text-text-secondary">
                        {new Date(sale.createdAt).toLocaleDateString("es-PE", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-text-primary">{formatCurrency(Number(sale.total))}</p>
                      <Badge variant={sale.status === "COMPLETADA" ? "success" : "danger"}>{sale.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Historial de pedidos</h2>
          {customer.orders.length === 0 ? (
            <EmptyState title="Sin pedidos registrados." />
          ) : (
            <div className="space-y-2">
              {customer.orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{order.code}</p>
                      <p className="text-[12px] text-text-secondary">
                        {new Date(order.createdAt).toLocaleDateString("es-PE", { dateStyle: "medium" })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-text-primary">{formatCurrency(Number(order.total))}</p>
                      <Badge variant="neutral">{order.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
