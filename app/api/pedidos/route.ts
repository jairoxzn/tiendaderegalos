import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { createOrderSchema } from "@/schemas/order";
import { listOrders, createOrder } from "@/services/orders";
import type { OrderStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);
    const isCustomParam = searchParams.get("isCustom");
    const result = await listOrders({
      status: (searchParams.get("status") as OrderStatus) || undefined,
      isCustom: isCustomParam ? isCustomParam === "true" : undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 20,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const order = await createOrder(parsed.data, session.user.id);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
