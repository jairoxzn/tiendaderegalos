import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { supplierSchema } from "@/schemas/supplier";
import { listSuppliers, createSupplier } from "@/services/suppliers";

export async function GET(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const suppliers = await listSuppliers(searchParams.get("search") || undefined);
    return NextResponse.json(suppliers);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const body = await request.json();
    const parsed = supplierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const supplier = await createSupplier(parsed.data);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
