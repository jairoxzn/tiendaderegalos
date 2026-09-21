import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { adjustStockSchema } from "@/schemas/inventory";
import { listMovements, adjustStock } from "@/services/inventory";
import type { InventoryMovementType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);
    const result = await listMovements({
      productId: searchParams.get("productId") || undefined,
      type: (searchParams.get("type") as InventoryMovementType) || undefined,
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 25,
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
    const parsed = adjustStockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const movement = await adjustStock(parsed.data, session.user.id);
    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Stock insuficiente")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
