import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { updateUserSchema } from "@/schemas/user";
import { updateUser } from "@/services/users";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const user = await updateUser(id, parsed.data);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("correo")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
