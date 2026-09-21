import { db } from "@/lib/db";
import type { CreateDeliveryInput } from "@/schemas/delivery";
import type { DeliveryStatus } from "@prisma/client";

export async function listDeliveries(status?: DeliveryStatus) {
  return db.delivery.findMany({
    where: status ? { status } : {},
    include: { order: { select: { code: true, isCustom: true } } },
    orderBy: { date: "asc" },
  });
}

export async function createDelivery(input: CreateDeliveryInput) {
  return db.delivery.create({
    data: {
      orderId: input.orderId,
      customerName: input.customerName,
      phone: input.phone,
      address: input.address,
      reference: input.reference || null,
      date: new Date(input.date),
      time: input.time || null,
      courierName: input.courierName || null,
      cost: input.cost,
    },
  });
}

export async function updateDeliveryStatus(id: string, status: DeliveryStatus) {
  const delivery = await db.delivery.update({ where: { id }, data: { status } });
  if (status === "ENTREGADO") {
    await db.order.update({ where: { id: delivery.orderId }, data: { status: "ENTREGADO" } });
  } else if (status === "EN_CAMINO") {
    await db.order.update({ where: { id: delivery.orderId }, data: { status: "EN_CAMINO" } });
  }
  return delivery;
}

export async function assignCourier(id: string, courierName: string) {
  return db.delivery.update({ where: { id }, data: { courierName } });
}
