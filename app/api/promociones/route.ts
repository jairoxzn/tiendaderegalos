import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { promotionSchema } from "@/schemas/promotion";
import { listPromotions, createPromotion } from "@/services/promotions";

export async function GET() {
  try {
    await requireSession(["ADMIN"]);
    const promotions = await listPromotions();
    return NextResponse.json(promotions);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const body = await request.json();
    const parsed = promotionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const promotion = await createPromotion(parsed.data);
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
