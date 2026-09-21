import { z } from "zod";

export const promotionItemSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  quantity: z.number().int().positive(),
});

export const promotionSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(150),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  startDate: z.string().min(1, "Selecciona una fecha de inicio"),
  endDate: z.string().min(1, "Selecciona una fecha final"),
  status: z.enum(["ACTIVA", "INACTIVA"]),
  items: z.array(promotionItemSchema).min(1, "Agrega al menos un producto"),
});

export type PromotionInput = z.infer<typeof promotionSchema>;
export type PromotionFormValues = z.input<typeof promotionSchema>;
