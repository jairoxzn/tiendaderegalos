import { db } from "@/lib/db";
import type { CustomerInput } from "@/schemas/customer";
import type { Prisma } from "@prisma/client";

export async function listCustomers(search?: string, page = 1, pageSize = 20) {
  const where: Prisma.CustomerWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
          { dni: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { sales: true, orders: true } } },
    }),
    db.customer.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function searchCustomersForPos(search: string) {
  return db.customer.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
    take: 10,
  });
}

export async function getCustomer(id: string) {
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      sales: { orderBy: { createdAt: "desc" }, take: 10 },
      orders: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!customer) return null;

  const aggregate = await db.sale.aggregate({
    where: { customerId: id, status: "COMPLETADA" },
    _sum: { total: true },
    _count: true,
    _max: { createdAt: true },
  });

  return {
    ...customer,
    stats: {
      totalPurchases: aggregate._count,
      totalSpent: aggregate._sum.total ?? 0,
      lastPurchase: aggregate._max.createdAt,
    },
  };
}

function toDateOrNull(value?: string) {
  return value ? new Date(value) : null;
}

export async function createCustomer(input: CustomerInput) {
  return db.customer.create({
    data: {
      name: input.name,
      dni: input.dni || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      address: input.address || null,
      birthday: toDateOrNull(input.birthday),
      anniversary: toDateOrNull(input.anniversary),
      notes: input.notes || null,
    },
  });
}

export async function updateCustomer(id: string, input: CustomerInput) {
  return db.customer.update({
    where: { id },
    data: {
      name: input.name,
      dni: input.dni || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      address: input.address || null,
      birthday: toDateOrNull(input.birthday),
      anniversary: toDateOrNull(input.anniversary),
      notes: input.notes || null,
    },
  });
}

export async function deleteCustomer(id: string) {
  const [salesCount, ordersCount] = await Promise.all([
    db.sale.count({ where: { customerId: id } }),
    db.order.count({ where: { customerId: id } }),
  ]);
  if (salesCount > 0 || ordersCount > 0) {
    throw new Error("No puedes eliminar este cliente porque tiene ventas o pedidos registrados.");
  }
  return db.customer.delete({ where: { id } });
}
