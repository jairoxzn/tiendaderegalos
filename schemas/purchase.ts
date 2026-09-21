import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  quantity: z.number().int().positive(),
  cost: z.number().min(0),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Selecciona un proveedor"),
  items: z.array(purchaseItemSchema).min(1, "Agrega al menos un producto"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
