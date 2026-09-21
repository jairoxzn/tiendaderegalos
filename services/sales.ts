import { db } from "@/lib/db";
import type { CreateSaleInput } from "@/schemas/sale";

async function generateSaleCode(): Promise<string> {
  const count = await db.sale.count();
  return `V-${String(count + 1).padStart(6, "0")}`;
}

export async function createSale(input: CreateSaleInput, userId: string) {
  return db.$transaction(async (tx) => {
    const register = await tx.cashRegister.findFirst({ where: { status: "ABIERTA" } });
    if (!register) {
      throw new Error("No hay una caja abierta. Ábrela antes de registrar una venta.");
    }

    const mergedItems = Array.from(
      input.items
        .reduce((map, item) => {
          map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
          return map;
        }, new Map<string, number>())
        .entries(),
    ).map(([productId, quantity]) => ({ productId, quantity }));

    const productIds = mergedItems.map((item) => item.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const resolvedItems = mergedItems.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error("Uno de los productos ya no existe.");
      if (product.status !== "ACTIVO") throw new Error(`"${product.name}" no está disponible.`);
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}.`);
      }
      const price = Number(product.price);
      const total = price * item.quantity;
      subtotal += total;
      return { product, quantity: item.quantity, price, total };
    });

    const discount = Math.min(input.discount, subtotal);
    const total = subtotal - discount;

    const paymentsSum = input.payments.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(paymentsSum - total) > 0.01) {
      throw new Error(
        `El monto pagado (${paymentsSum.toFixed(2)}) no coincide con el total (${total.toFixed(2)}).`,
      );
    }

    const code = await generateSaleCode();

    const sale = await tx.sale.create({
      data: {
        code,
        customerId: input.customerId || null,
        userId,
        cashRegisterId: register.id,
        subtotal,
        discount,
        total,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
        payments: {
          create: input.payments.map((p) => ({
            method: p.method,
            amount: p.amount,
            reference: p.reference || null,
          })),
        },
      },
      include: { items: { include: { product: true } }, payments: true, customer: true },
    });

    for (const item of resolvedItems) {
      const stockAfter = item.product.stock - item.quantity;
      await tx.product.update({ where: { id: item.product.id }, data: { stock: stockAfter } });
      await tx.inventoryMovement.create({
        data: {
          productId: item.product.id,
          type: "SALIDA_VENTA",
          quantity: item.quantity,
          stockBefore: item.product.stock,
          stockAfter,
          referenceType: "SALE",
          referenceId: sale.id,
          userId,
        },
      });
    }

    const cashAmount = input.payments
      .filter((p) => p.method === "EFECTIVO")
      .reduce((sum, p) => sum + p.amount, 0);

    if (cashAmount > 0) {
      await tx.cashMovement.create({
        data: {
          cashRegisterId: register.id,
          type: "VENTA",
          amount: cashAmount,
          description: `Venta ${code}`,
          userId,
        },
      });
    }

    return sale;
  });
}

export async function listRecentSales(take = 15) {
  return db.sale.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { customer: { select: { name: true } }, user: { select: { name: true } }, payments: true },
  });
}

export async function getSale(id: string) {
  return db.sale.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true, sku: true } } } },
      payments: true,
      customer: true,
      user: { select: { name: true } },
    },
  });
}
