import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { listRegisterHistory } from "@/services/cash-register";

export async function GET(request: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);
    const result = await listRegisterHistory(
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("pageSize")) || 20,
    );
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
