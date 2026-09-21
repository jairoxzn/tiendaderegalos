import { db } from "@/lib/db";
import type { CreateOrderInput } from "@/schemas/order";
import type { CustomOrderStatus, OrderStatus, Prisma } from "@prisma/client";

async function generateOrderCode(): Promise<string> {
  const count = await db.order.count();
  return `P-${String(count + 1).padStart(6, "0")}`;
}

export interface ListOrdersParams {
  status?: OrderStatus;
  isCustom?: boolean;
  page?: number;
  pageSize?: number;
}

export async function listOrders(params: ListOrdersParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const where: Prisma.OrderWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.isCustom !== undefined ? { isCustom: params.isCustom } : {}),
  };

  const [items, total] = await Promise.all([
    db.order.findMany({
      where,
      include: { customer: { select: { name: true, phone: true } }, delivery: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: { select: { name: true, images: { take: 1 } } } } },
      delivery: true,
      user: { select: { name: true } },
    },
  });
}

export async function createOrder(input: CreateOrderInput, userId: string) {
  const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deposit = Math.min(input.deposit, total);
  const balance = total - deposit;
  const code = await generateOrderCode();

  return db.order.create({
    data: {
      code,
      customerId: input.customerId,
      userId,
      message: input.message || null,
      deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : null,
      deliveryTime: input.deliveryTime || null,
      address: input.address || null,
      reference: input.reference || null,
      deposit,
      balance,
      total,
      paymentMethod: input.paymentMethod || null,
      isCustom: input.isCustom,
      customText: input.customText || null,
      customColor: input.customColor || null,
      customReference: input.customReference || null,
      customImageUrl: input.customImageUrl || null,
      customDesignUrl: input.customDesignUrl || null,
      customStatus: input.isCustom ? "DISENO_PENDIENTE" : null,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId || null,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
      },
    },
    include: { items: true, customer: true },
  });
}

export async function updateOrderStatus(
  id: string,
  data: { status?: OrderStatus; customStatus?: CustomOrderStatus },
) {
  return db.order.update({ where: { id }, data });
}

export async function updateOrderDeposit(id: string, deposit: number) {
  const order = await db.order.findUniqueOrThrow({ where: { id } });
  const clampedDeposit = Math.min(Math.max(deposit, 0), Number(order.total));
  return db.order.update({
    where: { id },
    data: { deposit: clampedDeposit, balance: Number(order.total) - clampedDeposit },
  });
}

export async function listOrdersWithoutDelivery() {
  return db.order.findMany({
    where: { delivery: null, status: { notIn: ["CANCELADO", "ENTREGADO"] } },
    include: { customer: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
}
