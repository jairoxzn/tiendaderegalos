import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import type { CategoryInput } from "@/schemas/category";

export async function listCategories() {
  return db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

export async function getCategory(id: string) {
  return db.category.findUnique({ where: { id } });
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (
    await db.category.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${++counter}`;
  }
  return slug;
}

export async function createCategory(input: CategoryInput) {
  const slug = await uniqueSlug(input.name);
  const last = await db.category.findFirst({ orderBy: { order: "desc" } });
  return db.category.create({
    data: {
      name: input.name,
      description: input.description || null,
      active: input.active,
      slug,
      order: (last?.order ?? -1) + 1,
    },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const current = await db.category.findUniqueOrThrow({ where: { id } });
  const slug = current.name === input.name ? current.slug : await uniqueSlug(input.name, id);
  return db.category.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description || null,
      active: input.active,
      slug,
    },
  });
}

export async function deleteCategory(id: string) {
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      "No puedes eliminar esta categoría porque tiene productos asociados. Desactívala en su lugar.",
    );
  }
  return db.category.delete({ where: { id } });
}
