import { db } from "@/lib/db";
import type { ExpenseInput } from "@/schemas/expense";

export async function listExpenses(page = 1, pageSize = 20) {
  const [items, total] = await Promise.all([
    db.expense.findMany({
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { user: { select: { name: true } } },
    }),
    db.expense.count(),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function createExpense(input: ExpenseInput, userId: string) {
  return db.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        category: input.category,
        description: input.description,
        amount: input.amount,
        date: new Date(input.date),
        paymentMethod: input.paymentMethod,
        userId,
      },
    });

    if (input.paymentMethod === "EFECTIVO") {
      const register = await tx.cashRegister.findFirst({ where: { status: "ABIERTA" } });
      if (register) {
        await tx.cashMovement.create({
          data: {
            cashRegisterId: register.id,
            type: "GASTO",
            amount: input.amount,
            description: `Gasto: ${input.description}`,
            userId,
          },
        });
      }
    }

    return expense;
  });
}

export async function deleteExpense(id: string) {
  return db.expense.delete({ where: { id } });
}
