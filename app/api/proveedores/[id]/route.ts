import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { supplierSchema } from "@/schemas/supplier";
import { getSupplier, updateSupplier, deleteSupplier } from "@/services/suppliers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    const supplier = await getSupplier(id);
    if (!supplier) return NextResponse.json({ error: "Proveedor no encontrado." }, { status: 404 });
    return NextResponse.json(supplier);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = supplierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const supplier = await updateSupplier(id, parsed.data);
    return NextResponse.json(supplier);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    await deleteSupplier(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("proveedor")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
