import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { createPurchaseSchema } from "@/schemas/purchase";
import { listPurchases, createPurchase } from "@/services/purchases";

export async function GET(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const result = await listPurchases(
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
    const parsed = createPurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const purchase = await createPurchase(parsed.data, session.user.id);
    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
