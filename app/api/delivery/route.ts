import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { createDeliverySchema } from "@/schemas/delivery";
import { listDeliveries, createDelivery } from "@/services/delivery";
import { listOrdersWithoutDelivery } from "@/services/orders";
import type { DeliveryStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);

    if (searchParams.get("availableOrders") === "true") {
      const orders = await listOrdersWithoutDelivery();
      return NextResponse.json(orders);
    }

    const deliveries = await listDeliveries((searchParams.get("status") as DeliveryStatus) || undefined);
    return NextResponse.json(deliveries);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = await request.json();
    const parsed = createDeliverySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const delivery = await createDelivery(parsed.data);
    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
