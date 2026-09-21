import { db } from "@/lib/db";
import type { PromotionInput } from "@/schemas/promotion";

export async function listPromotions() {
  return db.promotion.findMany({
    orderBy: { startDate: "desc" },
    include: { items: { include: { product: { select: { name: true, images: { take: 1 } } } } } },
  });
}

export async function listActivePromotions() {
  const now = new Date();
  return db.promotion.findMany({
    where: { status: "ACTIVA", startDate: { lte: now }, endDate: { gte: now } },
    include: { items: { include: { product: { select: { name: true, images: { take: 1 } } } } } },
  });
}

export async function getPromotion(id: string) {
  return db.promotion.findUnique({ where: { id }, include: { items: true } });
}

export async function createPromotion(input: PromotionInput) {
  return db.promotion.create({
    data: {
      name: input.name,
      description: input.description || null,
      price: input.price,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      status: input.status,
      items: { create: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
    },
  });
}

export async function updatePromotion(id: string, input: PromotionInput) {
  return db.$transaction(async (tx) => {
    await tx.promotionItem.deleteMany({ where: { promotionId: id } });
    return tx.promotion.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description || null,
        price: input.price,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: input.status,
        items: { create: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
      },
    });
  });
}

export async function deletePromotion(id: string) {
  return db.promotion.delete({ where: { id } });
}
