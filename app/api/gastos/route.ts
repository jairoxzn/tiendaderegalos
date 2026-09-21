import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { expenseSchema } from "@/schemas/expense";
import { listExpenses, createExpense } from "@/services/expenses";

export async function GET(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const result = await listExpenses(
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("pageSize")) || 20,
    );
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(["ADMIN"]);
    const body = await request.json();
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const expense = await createExpense(parsed.data, session.user.id);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
