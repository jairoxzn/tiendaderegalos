import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { createUserSchema } from "@/schemas/user";
import { listUsers, createUser } from "@/services/users";

export async function GET() {
  try {
    await requireSession(["ADMIN"]);
    const users = await listUsers();
    return NextResponse.json(users);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const user = await createUser(parsed.data);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("correo")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
