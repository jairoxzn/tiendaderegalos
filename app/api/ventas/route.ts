import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { createSaleSchema } from "@/schemas/sale";
import { createSale, listRecentSales } from "@/services/sales";

export async function GET() {
  try {
    await requireSession();
    const sales = await listRecentSales();
    return NextResponse.json(sales);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = createSaleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const sale = await createSale(parsed.data, session.user.id);
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
