import { z } from "zod";

export const salePaymentMethods = ["EFECTIVO", "YAPE", "PLIN", "TARJETA", "TRANSFERENCIA"] as const;

export const saleItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const salePaymentSchema = z.object({
  method: z.enum(salePaymentMethods),
  amount: z.number().positive(),
  reference: z.string().max(80).optional(),
});

export const createSaleSchema = z.object({
  customerId: z.string().min(1).nullable().optional(),
  items: z.array(saleItemSchema).min(1, "Agrega al menos un producto al carrito"),
  discount: z.number().min(0).default(0),
  payments: z.array(salePaymentSchema).min(1, "Selecciona al menos un método de pago"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
