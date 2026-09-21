import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { toggleProductStatus } from "@/services/products";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    const product = await toggleProductStatus(id);
    return NextResponse.json(product);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
