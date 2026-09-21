import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import { customerSchema } from "@/schemas/customer";
import { listCustomers, createCustomer, searchCustomersForPos } from "@/services/customers";

export async function GET(request: Request) {
  try {
    await requireSession();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    if (searchParams.get("pos") === "true" && search) {
      const customers = await searchCustomersForPos(search);
      return NextResponse.json(customers);
    }

    const result = await listCustomers(
      search,
      Number(searchParams.get("page")) || 1,
      Number(searchParams.get("pageSize")) || 20,
    );
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos.", issues: parsed.error.flatten() }, { status: 400 });
    }
    const customer = await createCustomer(parsed.data);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
