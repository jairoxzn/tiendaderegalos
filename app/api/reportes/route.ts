import { NextResponse } from "next/server";
import { requireSession, apiErrorResponse } from "@/lib/api-auth";
import {
  parseRange,
  getSalesReport,
  getInventoryReport,
  getCustomersReport,
  getOrdersReport,
  getCashReport,
} from "@/services/reports";

export async function GET(request: Request) {
  try {
    await requireSession(["ADMIN"]);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "ventas";
    const range = parseRange(searchParams.get("from") || undefined, searchParams.get("to") || undefined);

    switch (type) {
      case "ventas":
        return NextResponse.json(await getSalesReport(range));
      case "inventario":
        return NextResponse.json(await getInventoryReport());
      case "clientes":
        return NextResponse.json(await getCustomersReport(range));
      case "pedidos":
        return NextResponse.json(await getOrdersReport(range));
      case "caja":
        return NextResponse.json(await getCashReport(range));
      default:
        return NextResponse.json({ error: "Tipo de reporte inválido." }, { status: 400 });
    }
  } catch (error) {
    return apiErrorResponse(error);
  }
}
