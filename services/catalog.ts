import { db } from "@/lib/db";

const NEW_PRODUCT_WINDOW_DAYS = 14;
const BEST_SELLER_COUNT = 8;

export async function getCatalogData() {
  const [settings, categories, bestSellerRows] = await Promise.all([
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
    db.saleItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: BEST_SELLER_COUNT,
    }),
  ]);

  const bestSellerIds = new Set(bestSellerRows.map((r) => r.productId));
  const newSince = new Date();
  newSince.setDate(newSince.getDate() - NEW_PRODUCT_WINDOW_DAYS);

  const products = categories.flatMap((category) =>
    category.products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      stock: product.stock,
      imageUrl: product.images[0]?.url ?? null,
      categoryId: category.id,
      categoryName: category.name,
      createdAt: product.createdAt.toISOString(),
      isNew: product.createdAt >= newSince,
      isBestSeller: bestSellerIds.has(product.id),
    })),
  );

  const categoryList = categories.map((c) => ({ id: c.id, name: c.name, count: c.products.length }));

  return { settings, categories: categoryList, products };
}
