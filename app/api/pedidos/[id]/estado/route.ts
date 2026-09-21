import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { updateOrderStatusSchema } from "@/schemas/order";
import { updateOrderStatus } from "@/services/orders";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    const order = await updateOrderStatus(id, parsed.data);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
