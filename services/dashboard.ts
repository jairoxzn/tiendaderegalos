import { db } from "@/lib/db";
import { toNumber } from "@/lib/currency";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    salesToday,
    salesMonth,
    pendingOrders,
    lowStockCount,
    openRegister,
    recentSales,
    recentOrders,
    salesLast7Days,
    topProductRows,
  ] = await Promise.all([
    db.sale.aggregate({
      where: { status: "COMPLETADA", createdAt: { gte: todayStart } },
      _sum: { total: true },
      _count: true,
    }),
    db.sale.aggregate({
      where: { status: "COMPLETADA", createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    db.order.count({ where: { status: { in: ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION"] } } }),
    db.product.findMany({ where: { status: "ACTIVO" }, select: { stock: true, minStock: true } }),
    db.cashRegister.findFirst({ where: { status: "ABIERTA" }, include: { movements: true } }),
    db.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
    db.sale.findMany({
      where: { status: "COMPLETADA", createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true },
    }),
    db.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const lowStock = lowStockCount.filter((p) => p.stock <= p.minStock).length;

  const cajaActual = openRegister
    ? toNumber(openRegister.openingAmount) +
      openRegister.movements.reduce((sum, m) => {
        if (m.type === "VENTA" || m.type === "INGRESO") return sum + toNumber(m.amount);
        if (m.type === "GASTO" || m.type === "RETIRO") return sum - toNumber(m.amount);
        return sum;
      }, 0)
    : null;

  const chartMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    chartMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const sale of salesLast7Days) {
    const key = sale.createdAt.toISOString().slice(0, 10);
    chartMap.set(key, (chartMap.get(key) ?? 0) + toNumber(sale.total));
  }
  const salesChart = Array.from(chartMap.entries()).map(([date, total]) => ({ date, total }));

  const topProductIds = topProductRows.map((r) => r.productId);
  const topProductDetails = await db.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true, images: { take: 1, orderBy: { order: "asc" } } },
  });
  const topProducts = topProductRows.map((row) => {
    const product = topProductDetails.find((p) => p.id === row.productId);
    return {
      id: row.productId,
      name: product?.name ?? "Producto eliminado",
      imageUrl: product?.images[0]?.url ?? null,
      quantity: row._sum.quantity ?? 0,
    };
  });

  return {
    salesToday: toNumber(salesToday._sum.total),
    salesTodayCount: salesToday._count,
    salesMonth: toNumber(salesMonth._sum.total),
    pendingOrders,
    lowStock,
    cajaActual,
    cajaAbierta: !!openRegister,
    salesChart,
    topProducts,
    recentSales,
    recentOrders,
  };
}
