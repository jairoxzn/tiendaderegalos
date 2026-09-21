import { db } from "@/lib/db";
import type { SupplierInput } from "@/schemas/supplier";
import type { Prisma } from "@prisma/client";

export async function listSuppliers(search?: string) {
  const where: Prisma.SupplierWhereInput = search
    ? { company: { contains: search, mode: "insensitive" } }
    : {};
  return db.supplier.findMany({
    where,
    orderBy: { company: "asc" },
    include: { _count: { select: { purchases: true } } },
  });
}

export async function getSupplier(id: string) {
  return db.supplier.findUnique({ where: { id } });
}

export async function createSupplier(input: SupplierInput) {
  return db.supplier.create({
    data: {
      company: input.company,
      ruc: input.ruc || null,
      contactName: input.contactName || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      address: input.address || null,
      notes: input.notes || null,
      active: input.active,
    },
  });
}

export async function updateSupplier(id: string, input: SupplierInput) {
  return db.supplier.update({
    where: { id },
    data: {
      company: input.company,
      ruc: input.ruc || null,
      contactName: input.contactName || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      address: input.address || null,
      notes: input.notes || null,
      active: input.active,
    },
  });
}

export async function deleteSupplier(id: string) {
  const purchaseCount = await db.purchase.count({ where: { supplierId: id } });
  if (purchaseCount > 0) {
    throw new Error("No puedes eliminar este proveedor porque tiene compras registradas. Desactívalo en su lugar.");
  }
  return db.supplier.delete({ where: { id } });
}
