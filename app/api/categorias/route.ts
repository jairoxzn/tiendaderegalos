import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { categorySchema } from "@/schemas/category";
import { listCategories, createCategory } from "@/services/categories";

export async function GET() {
  try {
    await requireSession();
    const categories = await listCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const category = await createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
