import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { createProductSchema } from "@/schemas/product";
import { listProducts, createProduct } from "@/services/products";
import { db } from "@/lib/db";
import type { ProductStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);

    const result = await listProducts({
      search: searchParams.get("search") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      status: (searchParams.get("status") as ProductStatus) || undefined,
      lowStockOnly: searchParams.get("lowStockOnly") === "true",
      page: Number(searchParams.get("page")) || 1,
      pageSize: Number(searchParams.get("pageSize")) || 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession(["ADMIN"]);
    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }

    const existingSku = await db.product.findUnique({ where: { sku: parsed.data.sku } });
    if (existingSku) {
      return NextResponse.json({ error: "Ya existe un producto con ese SKU." }, { status: 400 });
    }

    const product = await createProduct(parsed.data, session.user.id);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
