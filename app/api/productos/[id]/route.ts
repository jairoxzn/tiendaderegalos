import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { updateProductSchema } from "@/schemas/product";
import { getProduct, updateProduct, deleteProduct } from "@/services/products";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const { id } = await params;
    const product = await getProduct(id);
    if (!product) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const existingSku = await db.product.findFirst({
      where: { sku: parsed.data.sku, NOT: { id } },
    });
    if (existingSku) {
      return NextResponse.json({ error: "Ya existe otro producto con ese SKU." }, { status: 400 });
    }

    const product = await updateProduct(id, parsed.data);
    return NextResponse.json(product);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireSession(["ADMIN"]);
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("producto")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return apiErrorResponse(error);
  }
}
