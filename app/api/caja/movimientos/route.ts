import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { cashMovementSchema } from "@/schemas/cash-register";
import { addCashMovement, getOpenRegister } from "@/services/cash-register";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = cashMovementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const register = await getOpenRegister();
    if (!register) {
      return NextResponse.json({ error: "No hay una caja abierta." }, { status: 400 });
    }

    const movement = await addCashMovement(register.id, parsed.data, session.user.id);
    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
