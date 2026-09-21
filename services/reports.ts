import { db } from "@/lib/db";
import { toNumber } from "@/lib/currency";

export interface DateRange {
  from: Date;
  to: Date;
}

export function parseRange(fromStr?: string, toStr?: string): DateRange {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const from = fromStr ? new Date(fromStr + "T00:00:00") : defaultFrom;
  const to = toStr ? new Date(toStr + "T23:59:59") : now;
  return { from, to };
}

export async function getSalesReport({ from, to }: DateRange) {
  const sales = await db.sale.findMany({
    where: { status: "COMPLETADA", createdAt: { gte: from, lte: to } },
    include: { user: { select: { name: true } }, payments: true },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + toNumber(s.total), 0);

  const byDayMap = new Map<string, { total: number; count: number }>();
  const byUserMap = new Map<string, { total: number; count: number }>();
  const byMethodMap = new Map<string, number>();

  for (const sale of sales) {
    const dayKey = sale.createdAt.toISOString().slice(0, 10);
    const day = byDayMap.get(dayKey) ?? { total: 0, count: 0 };
    day.total += toNumber(sale.total);
    day.count += 1;
    byDayMap.set(dayKey, day);

    const userName = sale.user?.name ?? "—";
    const user = byUserMap.get(userName) ?? { total: 0, count: 0 };
    user.total += toNumber(sale.total);
    user.count += 1;
    byUserMap.set(userName, user);

    for (const payment of sale.payments) {
      byMethodMap.set(payment.method, (byMethodMap.get(payment.method) ?? 0) + toNumber(payment.amount));
    }
  }

  return {
    totalRevenue,
    totalCount: sales.length,
    byDay: Array.from(byDayMap.entries()).map(([date, v]) => ({ date, ...v })).sort((a, b) => a.date.localeCompare(b.date)),
    byUser: Array.from(byUserMap.entries()).map(([userName, v]) => ({ userName, ...v })).sort((a, b) => b.total - a.total),
    byMethod: Array.from(byMethodMap.entries()).map(([method, total]) => ({ method, total })).sort((a, b) => b.total - a.total),
  };
}

export async function getInventoryReport() {
  const products = await db.product.findMany({
    where: { status: "ACTIVO" },
    include: { category: { select: { name: true } } },
  });

  const stockBajo = products.filter((p) => p.stock <= p.minStock);
  const valorizado = products.reduce((sum, p) => sum + p.stock * toNumber(p.cost), 0);

  const soldQuantities = await db.saleItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  });
  const soldMap = new Map(soldQuantities.map((s) => [s.productId, s._sum.quantity ?? 0]));

  const withSales = products
    .map((p) => ({ ...p, sold: soldMap.get(p.id) ?? 0 }))
    .sort((a, b) => b.sold - a.sold);

  return {
    products,
    stockBajo,
    valorizado,
    masVendidos: withSales.slice(0, 10),
    menosVendidos: [...withSales].sort((a, b) => a.sold - b.sold).slice(0, 10),
  };
}

export async function getCustomersReport({ from, to }: DateRange) {
  const [nuevos, sales] = await Promise.all([
    db.customer.findMany({ where: { createdAt: { gte: from, lte: to } }, orderBy: { createdAt: "desc" } }),
    db.sale.findMany({
      where: { status: "COMPLETADA", createdAt: { gte: from, lte: to }, customerId: { not: null } },
      include: { customer: { select: { id: true, name: true } } },
    }),
  ]);

  const byCustomer = new Map<string, { name: string; total: number; count: number }>();
  for (const sale of sales) {
    if (!sale.customer) continue;
    const entry = byCustomer.get(sale.customer.id) ?? { name: sale.customer.name, total: 0, count: 0 };
    entry.total += toNumber(sale.total);
    entry.count += 1;
    byCustomer.set(sale.customer.id, entry);
  }

  const ranked = Array.from(byCustomer.values());

  return {
    nuevos,
    frecuentes: [...ranked].sort((a, b) => b.count - a.count).filter((c) => c.count >= 2).slice(0, 10),
    mayorConsumo: [...ranked].sort((a, b) => b.total - a.total).slice(0, 10),
  };
}

export async function getOrdersReport({ from, to }: DateRange) {
  const orders = await db.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    pendientes: orders.filter((o) => !["ENTREGADO", "CANCELADO"].includes(o.status)).length,
    entregados: orders.filter((o) => o.status === "ENTREGADO").length,
    cancelados: orders.filter((o) => o.status === "CANCELADO").length,
  };

  return { orders, counts };
}

export async function getCashReport({ from, to }: DateRange) {
  const registers = await db.cashRegister.findMany({
    where: { openedAt: { gte: from, lte: to } },
    include: { movements: true, openedBy: { select: { name: true } } },
    orderBy: { openedAt: "desc" },
  });

  const summary = registers.reduce(
    (acc, r) => {
      for (const m of r.movements) {
        if (m.type === "VENTA") acc.ingresosPorVenta += toNumber(m.amount);
        if (m.type === "INGRESO") acc.otrosIngresos += toNumber(m.amount);
        if (m.type === "GASTO") acc.gastos += toNumber(m.amount);
        if (m.type === "RETIRO") acc.retiros += toNumber(m.amount);
      }
      if (r.difference !== null) acc.diferenciaTotal += toNumber(r.difference);
      return acc;
    },
    { ingresosPorVenta: 0, otrosIngresos: 0, gastos: 0, retiros: 0, diferenciaTotal: 0 },
  );

  return { registers, summary };
}
