import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(80),
  description: z.string().max(300).optional().or(z.literal("")),
  active: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
