import { z } from "zod";

export const businessSettingsSchema = z.object({
  storeName: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  ruc: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  logoUrl: z.string().nullable().optional(),
  receiptFooterText: z.string().max(300).optional().or(z.literal("")),
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
