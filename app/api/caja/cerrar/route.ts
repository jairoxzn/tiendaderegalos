import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { closeRegisterSchema } from "@/schemas/cash-register";
import { closeRegister, getOpenRegister } from "@/services/cash-register";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = closeRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const register = await getOpenRegister();
    if (!register) {
      return NextResponse.json({ error: "No hay una caja abierta." }, { status: 400 });
    }

    const closed = await closeRegister(register.id, parsed.data.closingAmount, session.user.id);
    return NextResponse.json(closed);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
