import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { customerSchema } from "@/schemas/customer";
import { getCustomer, updateCustomer, deleteCustomer } from "@/services/customers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const customer = await getCustomer(id);
    if (!customer) return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    return NextResponse.json(customer);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const customer = await updateCustomer(id, parsed.data);
    return NextResponse.json(customer);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    await deleteCustomer(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("cliente")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
