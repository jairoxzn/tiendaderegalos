import { z } from "zod";

export const userRoles = ["ADMIN", "VENDEDOR"] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(userRoles),
  active: z.boolean(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional().or(z.literal("")),
  role: z.enum(userRoles),
  active: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
