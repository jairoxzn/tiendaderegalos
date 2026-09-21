import { db } from "@/lib/db";
import type { CashMovementInput } from "@/schemas/cash-register";

export async function getOpenRegister() {
  return db.cashRegister.findFirst({
    where: { status: "ABIERTA" },
    include: {
      openedBy: { select: { name: true } },
      movements: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
    },
  });
}

export async function openRegister(openingAmount: number, userId: string) {
  const existing = await db.cashRegister.findFirst({ where: { status: "ABIERTA" } });
  if (existing) {
    throw new Error("Ya existe una caja abierta. Ciérrala antes de abrir una nueva.");
  }
  return db.cashRegister.create({
    data: { openingAmount, openedById: userId },
  });
}

export async function addCashMovement(cashRegisterId: string, input: CashMovementInput, userId: string) {
  const register = await db.cashRegister.findUniqueOrThrow({ where: { id: cashRegisterId } });
  if (register.status !== "ABIERTA") {
    throw new Error("Esta caja ya está cerrada.");
  }
  return db.cashMovement.create({
    data: {
      cashRegisterId,
      type: input.type,
      amount: input.amount,
      description: input.description || null,
      userId,
    },
  });
}

async function computeExpectedAmount(cashRegisterId: string) {
  const register = await db.cashRegister.findUniqueOrThrow({
    where: { id: cashRegisterId },
    include: { movements: true },
  });

  // Only the cash (EFECTIVO) portion of sales is logged as a VENTA movement
  // (see services/sales.ts) — card/Yape/Plin/transfer payments are revenue
  // but never touch the physical drawer, so they must not affect this total.
  const movementsTotal = register.movements.reduce((sum, m) => {
    if (m.type === "VENTA" || m.type === "INGRESO") return sum + Number(m.amount);
    if (m.type === "GASTO" || m.type === "RETIRO") return sum - Number(m.amount);
    return sum;
  }, 0);

  return Number(register.openingAmount) + movementsTotal;
}

export async function closeRegister(cashRegisterId: string, closingAmount: number, userId: string) {
  const register = await db.cashRegister.findUniqueOrThrow({ where: { id: cashRegisterId } });
  if (register.status !== "ABIERTA") {
    throw new Error("Esta caja ya fue cerrada.");
  }

  const expectedAmount = await computeExpectedAmount(cashRegisterId);
  const difference = closingAmount - expectedAmount;

  return db.cashRegister.update({
    where: { id: cashRegisterId },
    data: {
      status: "CERRADA",
      closingAmount,
      expectedAmount,
      difference,
      closedAt: new Date(),
      closedById: userId,
    },
  });
}

export async function listRegisterHistory(page = 1, pageSize = 20) {
  const [items, total] = await Promise.all([
    db.cashRegister.findMany({
      orderBy: { openedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { openedBy: { select: { name: true } }, closedBy: { select: { name: true } } },
    }),
    db.cashRegister.count(),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
