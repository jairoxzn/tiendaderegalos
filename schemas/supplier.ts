import { z } from "zod";

export const supplierSchema = z.object({
  company: z.string().min(2, "La empresa debe tener al menos 2 caracteres").max(150),
  ruc: z.string().max(20).optional().or(z.literal("")),
  contactName: z.string().max(120).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  active: z.boolean(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
