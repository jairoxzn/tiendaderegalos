import { z } from "zod";

export const openRegisterSchema = z.object({
  openingAmount: z.coerce.number().min(0, "El monto no puede ser negativo"),
});

export const manualCashMovementTypes = ["INGRESO", "GASTO", "RETIRO"] as const;

export const cashMovementSchema = z.object({
  type: z.enum(manualCashMovementTypes),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().max(300).optional().or(z.literal("")),
});

export const closeRegisterSchema = z.object({
  closingAmount: z.coerce.number().min(0, "El monto no puede ser negativo"),
});

export type OpenRegisterInput = z.infer<typeof openRegisterSchema>;
export type OpenRegisterFormValues = z.input<typeof openRegisterSchema>;
export type CashMovementInput = z.infer<typeof cashMovementSchema>;
export type CashMovementFormValues = z.input<typeof cashMovementSchema>;
export type CloseRegisterInput = z.infer<typeof closeRegisterSchema>;
export type CloseRegisterFormValues = z.input<typeof closeRegisterSchema>;
