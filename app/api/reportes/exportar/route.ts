import ExcelJS from "exceljs";
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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "GiftFlow";

    if (type === "ventas") {
      const report = await getSalesReport(range);
      const sheet = workbook.addWorksheet("Ventas por día");
      sheet.columns = [
        { header: "Fecha", key: "date", width: 14 },
        { header: "Ventas", key: "count", width: 12 },
        { header: "Total (S/)", key: "total", width: 14 },
      ];
      sheet.addRows(report.byDay);
      const byUser = workbook.addWorksheet("Por usuario");
      byUser.columns = [
        { header: "Usuario", key: "userName", width: 24 },
        { header: "Ventas", key: "count", width: 12 },
        { header: "Total (S/)", key: "total", width: 14 },
      ];
      byUser.addRows(report.byUser);
      const byMethod = workbook.addWorksheet("Por método de pago");
      byMethod.columns = [
        { header: "Método", key: "method", width: 20 },
        { header: "Total (S/)", key: "total", width: 14 },
      ];
      byMethod.addRows(report.byMethod);
    } else if (type === "inventario") {
      const report = await getInventoryReport();
      const sheet = workbook.addWorksheet("Stock actual");
      sheet.columns = [
        { header: "SKU", key: "sku", width: 14 },
        { header: "Producto", key: "name", width: 30 },
        { header: "Categoría", key: "category", width: 20 },
        { header: "Stock", key: "stock", width: 10 },
        { header: "Stock mínimo", key: "minStock", width: 14 },
        { header: "Costo (S/)", key: "cost", width: 12 },
      ];
      sheet.addRows(report.products.map((p) => ({ sku: p.sku, name: p.name, category: p.category.name, stock: p.stock, minStock: p.minStock, cost: Number(p.cost) })));
      const top = workbook.addWorksheet("Más vendidos");
      top.columns = [
        { header: "Producto", key: "name", width: 30 },
        { header: "Unidades vendidas", key: "sold", width: 18 },
      ];
      top.addRows(report.masVendidos.map((p) => ({ name: p.name, sold: p.sold })));
    } else if (type === "clientes") {
      const report = await getCustomersReport(range);
      const sheet = workbook.addWorksheet("Mayor consumo");
      sheet.columns = [
        { header: "Cliente", key: "name", width: 26 },
        { header: "Compras", key: "count", width: 12 },
        { header: "Total gastado (S/)", key: "total", width: 18 },
      ];
      sheet.addRows(report.mayorConsumo);
      const nuevos = workbook.addWorksheet("Nuevos clientes");
      nuevos.columns = [
        { header: "Nombre", key: "name", width: 26 },
        { header: "Teléfono", key: "phone", width: 16 },
        { header: "Registrado", key: "createdAt", width: 16 },
      ];
      nuevos.addRows(report.nuevos.map((c) => ({ name: c.name, phone: c.phone ?? "", createdAt: c.createdAt.toISOString().slice(0, 10) })));
    } else if (type === "pedidos") {
      const report = await getOrdersReport(range);
      const sheet = workbook.addWorksheet("Pedidos");
      sheet.columns = [
        { header: "Código", key: "code", width: 14 },
        { header: "Cliente", key: "customer", width: 24 },
        { header: "Estado", key: "status", width: 16 },
        { header: "Total (S/)", key: "total", width: 14 },
        { header: "Fecha", key: "createdAt", width: 16 },
      ];
      sheet.addRows(
        report.orders.map((o) => ({
          code: o.code,
          customer: o.customer.name,
          status: o.status,
          total: Number(o.total),
          createdAt: o.createdAt.toISOString().slice(0, 10),
        })),
      );
    } else if (type === "caja") {
      const report = await getCashReport(range);
      const sheet = workbook.addWorksheet("Cierres de caja");
      sheet.columns = [
        { header: "Abierta por", key: "openedBy", width: 20 },
        { header: "Apertura", key: "openedAt", width: 18 },
        { header: "Monto inicial (S/)", key: "openingAmount", width: 16 },
        { header: "Esperado (S/)", key: "expectedAmount", width: 16 },
        { header: "Contado (S/)", key: "closingAmount", width: 16 },
        { header: "Diferencia (S/)", key: "difference", width: 16 },
      ];
      sheet.addRows(
        report.registers.map((r) => ({
          openedBy: r.openedBy.name,
          openedAt: r.openedAt.toISOString().slice(0, 16).replace("T", " "),
          openingAmount: Number(r.openingAmount),
          expectedAmount: r.expectedAmount ? Number(r.expectedAmount) : "",
          closingAmount: r.closingAmount ? Number(r.closingAmount) : "",
          difference: r.difference ? Number(r.difference) : "",
        })),
      );
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="reporte-${type}.xlsx"`,
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
