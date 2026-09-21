import { db } from "@/lib/db";
import type { AdjustStockInput } from "@/schemas/inventory";
import type { InventoryMovementType, Prisma } from "@prisma/client";

const ENTRADA_TYPES: InventoryMovementType[] = ["ENTRADA_COMPRA", "ENTRADA_DEVOLUCION", "ENTRADA_AJUSTE"];

export interface ListMovementsParams {
  productId?: string;
  type?: InventoryMovementType;
  page?: number;
  pageSize?: number;
}

export async function listMovements(params: ListMovementsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;

  const where: Prisma.InventoryMovementWhereInput = {
    ...(params.productId ? { productId: params.productId } : {}),
    ...(params.type ? { type: params.type } : {}),
  };

  const [items, total] = await Promise.all([
    db.inventoryMovement.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, unit: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.inventoryMovement.count({ where }),
  ]);

  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function adjustStock(input: AdjustStockInput, userId: string) {
  return db.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: input.productId } });
    const isEntrada = ENTRADA_TYPES.includes(input.type);
    const stockBefore = product.stock;
    const stockAfter = isEntrada ? stockBefore + input.quantity : stockBefore - input.quantity;

    if (stockAfter < 0) {
      throw new Error(`Stock insuficiente. Disponible: ${stockBefore}.`);
    }

    await tx.product.update({ where: { id: input.productId }, data: { stock: stockAfter } });

    return tx.inventoryMovement.create({
      data: {
        productId: input.productId,
        type: input.type,
        quantity: input.quantity,
        stockBefore,
        stockAfter,
        reason: input.reason || null,
        referenceType: "MANUAL",
        userId,
      },
    });
  });
}
