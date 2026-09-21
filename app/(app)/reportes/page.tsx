"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/currency";
import { orderStatusLabels } from "@/lib/order-labels";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function monthStartISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

type ReportType = "ventas" | "inventario" | "clientes" | "pedidos" | "caja";

export default function ReportesPage() {
  const [tab, setTab] = useState<ReportType>("ventas");
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loadedTab, setLoadedTab] = useState<ReportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type: tab, from, to });
    fetch(`/api/reportes?${params}`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoadedTab(tab);
      })
      .finally(() => setLoading(false));
  }, [tab, from, to]);

  const dataReady = !loading && data && loadedTab === tab;

  const exportUrl = `/api/reportes/exportar?${new URLSearchParams({ type: tab, from, to })}`;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Reportes</h1>
          <p className="text-[13px] text-text-secondary">Analiza el desempeño de tu tienda.</p>
        </div>
        <div className="no-print flex flex-wrap items-end gap-2">
          <Input label="Desde" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input label="Hasta" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <a href={exportUrl} download>
            <Button variant="secondary">
              <Download className="size-4" />
              Excel
            </Button>
          </a>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="size-4" />
            PDF
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as ReportType)}>
        <TabsList className="no-print mb-6">
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="inventario">Inventario</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="caja">Caja</TabsTrigger>
        </TabsList>

        {!dataReady ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <>
            <TabsContent value="ventas">
              <SalesReportView data={data as unknown as SalesReport} />
            </TabsContent>
            <TabsContent value="inventario">
              <InventoryReportView data={data as unknown as InventoryReport} />
            </TabsContent>
            <TabsContent value="clientes">
              <CustomersReportView data={data as unknown as CustomersReport} />
            </TabsContent>
            <TabsContent value="pedidos">
              <OrdersReportView data={data as unknown as OrdersReport} />
            </TabsContent>
            <TabsContent value="caja">
              <CashReportView data={data as unknown as CashReport} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

interface SalesReport {
  totalRevenue: number;
  totalCount: number;
  byDay: { date: string; total: number; count: number }[];
  byUser: { userName: string; total: number; count: number }[];
  byMethod: { method: string; total: number }[];
}

function SalesReportView({ data }: { data: SalesReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Ingresos totales</p><p className="mt-1 text-[22px] font-semibold text-text-primary">{formatCurrency(data.totalRevenue)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Ventas totales</p><p className="mt-1 text-[22px] font-semibold text-text-primary">{data.totalCount}</p></CardContent></Card>
      </div>

      <div>
        <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Por día</h3>
        {data.byDay.length === 0 ? <EmptyState title="Sin ventas en este período." /> : (
          <Table>
            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Ventas</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.byDay.map((d) => (
                <TableRow key={d.date}><TableCell>{d.date}</TableCell><TableCell>{d.count}</TableCell><TableCell>{formatCurrency(d.total)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Por usuario</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Usuario</TableHead><TableHead>Ventas</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.byUser.map((u) => (
                <TableRow key={u.userName}><TableCell>{u.userName}</TableCell><TableCell>{u.count}</TableCell><TableCell>{formatCurrency(u.total)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div>
          <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Por método de pago</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Método</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.byMethod.map((m) => (
                <TableRow key={m.method}><TableCell>{m.method}</TableCell><TableCell>{formatCurrency(m.total)}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

interface InventoryReport {
  products: { id: string; name: string; sku: string; stock: number; minStock: number; category: { name: string } }[];
  stockBajo: { id: string; name: string; stock: number; minStock: number }[];
  valorizado: number;
  masVendidos: { id: string; name: string; sold: number }[];
  menosVendidos: { id: string; name: string; sold: number }[];
}

function InventoryReportView({ data }: { data: InventoryReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Productos activos</p><p className="mt-1 text-[22px] font-semibold text-text-primary">{data.products.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Stock bajo</p><p className="mt-1 text-[22px] font-semibold text-warning">{data.stockBajo.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Inventario valorizado</p><p className="mt-1 text-[22px] font-semibold text-text-primary">{formatCurrency(data.valorizado)}</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Más vendidos</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Unidades</TableHead></TableRow></TableHeader>
            <TableBody>{data.masVendidos.map((p) => (<TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.sold}</TableCell></TableRow>))}</TableBody>
          </Table>
        </div>
        <div>
          <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Menos vendidos</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Producto</TableHead><TableHead>Unidades</TableHead></TableRow></TableHeader>
            <TableBody>{data.menosVendidos.map((p) => (<TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.sold}</TableCell></TableRow>))}</TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

interface CustomersReport {
  nuevos: { id: string; name: string; phone: string | null }[];
  frecuentes: { name: string; total: number; count: number }[];
  mayorConsumo: { name: string; total: number; count: number }[];
}

function CustomersReportView({ data }: { data: CustomersReport }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div>
        <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Nuevos ({data.nuevos.length})</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Teléfono</TableHead></TableRow></TableHeader>
          <TableBody>{data.nuevos.map((c) => (<TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.phone || "—"}</TableCell></TableRow>))}</TableBody>
        </Table>
      </div>
      <div>
        <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Frecuentes</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Compras</TableHead></TableRow></TableHeader>
          <TableBody>{data.frecuentes.map((c) => (<TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{c.count}</TableCell></TableRow>))}</TableBody>
        </Table>
      </div>
      <div>
        <h3 className="mb-2 text-[14px] font-semibold text-text-primary">Mayor consumo</h3>
        <Table>
          <TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
          <TableBody>{data.mayorConsumo.map((c) => (<TableRow key={c.name}><TableCell>{c.name}</TableCell><TableCell>{formatCurrency(c.total)}</TableCell></TableRow>))}</TableBody>
        </Table>
      </div>
    </div>
  );
}

interface OrdersReport {
  orders: { id: string; code: string; status: keyof typeof orderStatusLabels; total: string; customer: { name: string } }[];
  counts: { pendientes: number; entregados: number; cancelados: number };
}

function OrdersReportView({ data }: { data: OrdersReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Pendientes</p><p className="mt-1 text-[22px] font-semibold text-warning">{data.counts.pendientes}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Entregados</p><p className="mt-1 text-[22px] font-semibold text-success">{data.counts.entregados}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Cancelados</p><p className="mt-1 text-[22px] font-semibold text-danger">{data.counts.cancelados}</p></CardContent></Card>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Cliente</TableHead><TableHead>Estado</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell>{o.code}</TableCell>
              <TableCell>{o.customer.name}</TableCell>
              <TableCell>{orderStatusLabels[o.status] ?? o.status}</TableCell>
              <TableCell>{formatCurrency(Number(o.total))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface CashReport {
  registers: {
    id: string;
    openedAt: string;
    closedAt: string | null;
    openingAmount: string;
    expectedAmount: string | null;
    closingAmount: string | null;
    difference: string | null;
    openedBy: { name: string };
  }[];
  summary: { ingresosPorVenta: number; otrosIngresos: number; gastos: number; retiros: number; diferenciaTotal: number };
}

function CashReportView({ data }: { data: CashReport }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Ingresos por venta</p><p className="mt-1 text-[18px] font-semibold text-success">{formatCurrency(data.summary.ingresosPorVenta)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Otros ingresos</p><p className="mt-1 text-[18px] font-semibold text-text-primary">{formatCurrency(data.summary.otrosIngresos)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Gastos y retiros</p><p className="mt-1 text-[18px] font-semibold text-danger">{formatCurrency(data.summary.gastos + data.summary.retiros)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-[12px] text-text-secondary">Diferencia acumulada</p><p className="mt-1 text-[18px] font-semibold text-text-primary">{formatCurrency(data.summary.diferenciaTotal)}</p></CardContent></Card>
      </div>
      <Table>
        <TableHeader><TableRow><TableHead>Abierta por</TableHead><TableHead>Apertura</TableHead><TableHead>Esperado</TableHead><TableHead>Contado</TableHead><TableHead>Diferencia</TableHead></TableRow></TableHeader>
        <TableBody>
          {data.registers.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.openedBy.name}</TableCell>
              <TableCell>{new Date(r.openedAt).toLocaleDateString("es-PE", { dateStyle: "medium" })}</TableCell>
              <TableCell>{r.expectedAmount ? formatCurrency(Number(r.expectedAmount)) : "—"}</TableCell>
              <TableCell>{r.closingAmount ? formatCurrency(Number(r.closingAmount)) : "Abierta"}</TableCell>
              <TableCell className={r.difference && Number(r.difference) !== 0 ? "text-danger" : ""}>
                {r.difference ? formatCurrency(Number(r.difference)) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
