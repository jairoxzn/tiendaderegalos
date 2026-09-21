import { z } from "zod";

export const orderStatusValues = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "EN_CAMINO",
  "ENTREGADO",
  "CANCELADO",
] as const;

export const customOrderStatusValues = [
  "DISENO_PENDIENTE",
  "DISENO_APROBADO",
  "EN_PRODUCCION",
  "LISTO",
  "ENTREGADO",
] as const;

export const orderPaymentMethods = ["EFECTIVO", "YAPE", "PLIN", "TARJETA", "TRANSFERENCIA"] as const;

export const orderItemSchema = z.object({
  productId: z.string().nullable().optional(),
  name: z.string().min(1, "Ingresa el nombre del producto"),
  quantity: z.number().int().positive(),
  price: z.number().min(0),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Selecciona un cliente"),
  items: z.array(orderItemSchema).min(1, "Agrega al menos un producto"),
  message: z.string().max(500).optional().or(z.literal("")),
  deliveryDate: z.string().optional().or(z.literal("")),
  deliveryTime: z.string().optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  reference: z.string().max(200).optional().or(z.literal("")),
  deposit: z.number().min(0).default(0),
  paymentMethod: z.enum(orderPaymentMethods).optional().nullable(),
  isCustom: z.boolean().default(false),
  customText: z.string().max(500).optional().or(z.literal("")),
  customColor: z.string().max(60).optional().or(z.literal("")),
  customReference: z.string().max(200).optional().or(z.literal("")),
  customImageUrl: z.string().nullable().optional(),
  customDesignUrl: z.string().nullable().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderFormValues = z.input<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues).optional(),
  customStatus: z.enum(customOrderStatusValues).optional(),
});
