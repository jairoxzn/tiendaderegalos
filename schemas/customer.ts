import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  dni: z.string().max(20).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  birthday: z.string().optional().or(z.literal("")),
  anniversary: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
