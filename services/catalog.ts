import { db } from "@/lib/db";

export async function getCatalogData() {
  const [settings, categories] = await Promise.all([
    db.businessSettings.findFirst(),
    db.category.findMany({
      where: { active: true, products: { some: { status: "ACTIVO" } } },
      orderBy: { order: "asc" },
      include: {
        products: {
          where: { status: "ACTIVO" },
          orderBy: { name: "asc" },
          include: { images: { orderBy: { order: "asc" }, take: 1 } },
        },
      },
    }),
  ]);

  return { settings, categories };
}
