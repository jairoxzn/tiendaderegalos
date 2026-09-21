import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { toggleUserActive } from "@/services/users";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await requireSession(["ADMIN"]);
    const { id } = await params;
    const user = await toggleUserActive(id, session.user.id);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("propia cuenta")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
