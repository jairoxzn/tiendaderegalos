import { z } from "zod";

export const productStatusValues = ["ACTIVO", "INACTIVO"] as const;

export const createProductSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio").max(40),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(120),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  description: z.string().max(500).optional().or(z.literal("")),
  cost: z.coerce.number().min(0, "El costo no puede ser negativo"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  minStock: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo"),
  unit: z.string().min(1).max(20),
  isCustomizable: z.boolean(),
  status: z.enum(productStatusValues),
  imageUrl: z.string().nullable().optional(),
});

export const updateProductSchema = createProductSchema.omit({ stock: true });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateProductFormValues = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
