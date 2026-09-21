import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { getSale } from "@/services/sales";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const sale = await getSale(id);
    if (!sale) return NextResponse.json({ error: "Venta no encontrada." }, { status: 404 });
    return NextResponse.json(sale);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
