import { z } from "zod";

export const expenseCategories = [
  "Alquiler",
  "Servicios",
  "Sueldos",
  "Insumos",
  "Marketing",
  "Transporte",
  "Mantenimiento",
  "Otros",
] as const;

export const expensePaymentMethods = ["EFECTIVO", "YAPE", "PLIN", "TARJETA", "TRANSFERENCIA"] as const;

export const expenseSchema = z.object({
  category: z.string().min(1, "Selecciona una categoría"),
  description: z.string().min(2, "Ingresa una descripción").max(300),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  date: z.string().min(1, "Selecciona una fecha"),
  paymentMethod: z.enum(expensePaymentMethods),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ExpenseFormValues = z.input<typeof expenseSchema>;
