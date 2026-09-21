import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { openRegisterSchema } from "@/schemas/cash-register";
import { getOpenRegister, openRegister } from "@/services/cash-register";

export async function GET() {
  try {
    await requireSession();
    const register = await getOpenRegister();
    return NextResponse.json(register);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = openRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const register = await openRegister(parsed.data.openingAmount, session.user.id);
    return NextResponse.json(register, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("caja abierta")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
