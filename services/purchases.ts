import { db } from "@/lib/db";
import type { CreatePurchaseInput } from "@/schemas/purchase";

async function generatePurchaseCode(): Promise<string> {
  const count = await db.purchase.count();
  return `C-${String(count + 1).padStart(6, "0")}`;
}

export async function createPurchase(input: CreatePurchaseInput, userId: string) {
  return db.$transaction(async (tx) => {
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error("Uno de los productos ya no existe.");
      total += item.cost * item.quantity;
    }

    const code = await generatePurchaseCode();

    const purchase = await tx.purchase.create({
      data: {
        code,
        supplierId: input.supplierId,
        userId,
        total,
        notes: input.notes || null,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            cost: item.cost,
            total: item.cost * item.quantity,
          })),
        },
      },
      include: { items: true, supplier: true },
    });

    for (const item of input.items) {
      const product = productMap.get(item.productId)!;
      const stockAfter = product.stock + item.quantity;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: stockAfter, cost: item.cost },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: "ENTRADA_COMPRA",
          quantity: item.quantity,
          stockBefore: product.stock,
          stockAfter,
          referenceType: "PURCHASE",
          referenceId: purchase.id,
          userId,
        },
      });
    }

    return purchase;
  });
}

export async function listPurchases(page = 1, pageSize = 20) {
  const [items, total] = await Promise.all([
    db.purchase.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { supplier: { select: { company: true } }, user: { select: { name: true } }, items: true },
    }),
    db.purchase.count(),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getPurchase(id: string) {
  return db.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      user: { select: { name: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  });
}
