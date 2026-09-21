import { z } from "zod";

export const manualMovementTypes = [
  "ENTRADA_AJUSTE",
  "ENTRADA_DEVOLUCION",
  "SALIDA_AJUSTE",
  "SALIDA_DANO",
  "SALIDA_PERDIDA",
] as const;

export const adjustStockSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  type: z.enum(manualMovementTypes),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a 0"),
  reason: z.string().max(300).optional().or(z.literal("")),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type AdjustStockFormValues = z.input<typeof adjustStockSchema>;
