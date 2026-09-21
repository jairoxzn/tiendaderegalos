import Link from "next/link";
import {
  ShoppingCart,
  Wallet,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Plus,
} from "lucide-react";
import { getDashboardStats } from "@/services/dashboard";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/product/ProductImage";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { auth } from "@/lib/auth";

const orderStatusLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default async function DashboardPage() {
  const [stats, session] = await Promise.all([getDashboardStats(), auth()]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-[13px] text-text-secondary">Aquí tienes el resumen de tu tienda.</p>
        </div>
        <Link href="/pos">
          <Button size="lg">
            <Plus className="size-4" />
            Nueva venta
          </Button>
        </Link>
      </div>

      {!stats.cajaAbierta && (
        <Alert variant="warning" title="No hay una caja abierta" className="mb-6">
          Abre la caja para comenzar a registrar ventas.{" "}
          <Link href="/caja" className="font-semibold underline">
            Ir a Caja
          </Link>
        </Alert>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <p className="text-[12px] text-text-secondary">Ventas de hoy</p>
            <p className="mt-1.5 text-[22px] font-semibold text-text-primary">{formatCurrency(stats.salesToday)}</p>
            <p className="mt-0.5 text-[11.5px] text-text-secondary">{stats.salesTodayCount} ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[12px] text-text-secondary">Ventas del mes</p>
            <p className="mt-1.5 text-[22px] font-semibold text-text-primary">{formatCurrency(stats.salesMonth)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[12px] text-text-secondary">Pedidos pendientes</p>
            <p className="mt-1.5 text-[22px] font-semibold text-text-primary">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[12px] text-text-secondary">Stock bajo</p>
            <p className={`mt-1.5 text-[22px] font-semibold ${stats.lowStock > 0 ? "text-warning" : "text-text-primary"}`}>
              {stats.lowStock}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-[12px] text-text-secondary">Caja actual</p>
            <p className="mt-1.5 text-[22px] font-semibold text-text-primary">
              {stats.cajaAbierta ? formatCurrency(stats.cajaActual ?? 0) : "Cerrada"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-1 flex items-center gap-2">
              <TrendingUp className="size-4 text-text-secondary" />
              <h2 className="text-[15px] font-semibold text-text-primary">Ventas — últimos 7 días</h2>
            </div>
            <SalesChart data={stats.salesChart} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 text-[15px] font-semibold text-text-primary">Productos más vendidos</h2>
            {stats.topProducts.length === 0 ? (
              <EmptyState title="Sin ventas todavía." />
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <span className="w-4 text-[12px] font-semibold text-text-secondary">{index + 1}</span>
                    <ProductImage src={product.imageUrl} alt={product.name} className="size-9 shrink-0" sizes="36px" />
                    <p className="flex-1 truncate text-[13px] font-medium text-text-primary">{product.name}</p>
                    <span className="text-[12px] text-text-secondary">{product.quantity} und.</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-text-secondary" />
                <h2 className="text-[15px] font-semibold text-text-primary">Ventas recientes</h2>
              </div>
            </div>
            {stats.recentSales.length === 0 ? (
              <EmptyState title="Sin ventas todavía." />
            ) : (
              <div className="space-y-2">
                {stats.recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between rounded-[12px] px-1 py-2">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{sale.code}</p>
                      <p className="text-[12px] text-text-secondary">{sale.customer?.name ?? "Cliente general"}</p>
                    </div>
                    <p className="text-[13px] font-semibold text-text-primary">{formatCurrency(Number(sale.total))}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="size-4 text-text-secondary" />
              <h2 className="text-[15px] font-semibold text-text-primary">Pedidos recientes</h2>
            </div>
            {stats.recentOrders.length === 0 ? (
              <EmptyState title="Sin pedidos todavía." />
            ) : (
              <div className="space-y-2">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-[12px] px-1 py-2">
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{order.code}</p>
                      <p className="text-[12px] text-text-secondary">{order.customer.name}</p>
                    </div>
                    <Badge variant="neutral">{orderStatusLabels[order.status] ?? order.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.lowStock > 0 && (
        <Alert variant="warning" title="Alertas de stock" className="mt-6">
          <div className="flex items-center justify-between">
            <span>Tienes {stats.lowStock} producto(s) con stock bajo o agotado.</span>
            <Link href="/inventario" className="inline-flex items-center gap-1 font-semibold underline">
              <AlertTriangle className="size-3.5" />
              Ver inventario
            </Link>
          </div>
        </Alert>
      )}
    </div>
  );
}
