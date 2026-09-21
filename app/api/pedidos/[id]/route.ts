import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { getOrder, updateOrderDeposit } from "@/services/orders";
import { z } from "zod";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const order = await getOrder(id);
    if (!order) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

const depositSchema = z.object({ deposit: z.number().min(0) });

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = depositSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    const order = await updateOrderDeposit(id, parsed.data.deposit);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
