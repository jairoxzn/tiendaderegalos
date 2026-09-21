import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { updateDeliveryStatus } from "@/services/delivery";
import { z } from "zod";
import { deliveryStatusValues } from "@/schemas/delivery";

interface Params {
  params: Promise<{ id: string }>;
}

const schema = z.object({ status: z.enum(deliveryStatusValues) });

export async function POST(request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    }
    const delivery = await updateDeliveryStatus(id, parsed.data.status);
    return NextResponse.json(delivery);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
