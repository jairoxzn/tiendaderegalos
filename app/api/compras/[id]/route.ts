import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { getPurchase } from "@/services/purchases";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    const purchase = await getPurchase(id);
    if (!purchase) return NextResponse.json({ error: "Compra no encontrada." }, { status: 404 });
    return NextResponse.json(purchase);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
