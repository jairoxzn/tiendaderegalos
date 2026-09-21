import { db } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import type { CreateProductInput, UpdateProductInput } from "@/schemas/product";
import type { Prisma, ProductStatus } from "@prisma/client";

export interface ListProductsParams {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  lowStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "producto";
  let slug = base;
  let counter = 1;
  while (
    await db.product.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${++counter}`;
  }
  return slug;
}

export async function listProducts(params: ListProductsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  const where: Prisma.ProductWhereInput = {
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { sku: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        images: { orderBy: { order: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  const filtered = params.lowStockOnly ? items.filter((p) => p.stock <= p.minStock) : items;

  return {
    items: filtered,
    total: params.lowStockOnly ? filtered.length : total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((params.lowStockOnly ? filtered.length : total) / pageSize)),
  };
}

export async function listActiveProductsForPos(search?: string, categoryId?: string) {
  return db.product.findMany({
    where: {
      status: "ACTIVO",
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { name: "asc" },
    take: 60,
  });
}

export async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: { category: true, images: { orderBy: { order: "asc" } } },
  });
}

function normalizeCompareAtPrice(compareAtPrice: number, price: number): number | null {
  return compareAtPrice > price ? compareAtPrice : null;
}

export async function createProduct(input: CreateProductInput, userId: string) {
  const slug = await uniqueSlug(input.name);

  return db.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        sku: input.sku,
        name: input.name,
        slug,
        categoryId: input.categoryId,
        description: input.description || null,
        cost: input.cost,
        price: input.price,
        compareAtPrice: normalizeCompareAtPrice(input.compareAtPrice, input.price),
        stock: input.stock,
        minStock: input.minStock,
        unit: input.unit,
        isCustomizable: input.isCustomizable,
        status: input.status,
        ...(input.imageUrl
          ? { images: { create: { url: input.imageUrl, isPrimary: true, order: 0 } } }
          : {}),
      },
    });

    if (input.stock > 0) {
      await tx.inventoryMovement.create({
        data: {
          productId: product.id,
          type: "ENTRADA_AJUSTE",
          quantity: input.stock,
          stockBefore: 0,
          stockAfter: input.stock,
          reason: "Stock inicial",
          referenceType: "PRODUCT_CREATE",
          userId,
        },
      });
    }

    return product;
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const current = await db.product.findUniqueOrThrow({ where: { id } });
  const slug = current.name === input.name ? current.slug : await uniqueSlug(input.name, id);

  return db.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { id },
      data: {
        sku: input.sku,
        name: input.name,
        slug,
        categoryId: input.categoryId,
        description: input.description || null,
        cost: input.cost,
        price: input.price,
        compareAtPrice: normalizeCompareAtPrice(input.compareAtPrice, input.price),
        minStock: input.minStock,
        unit: input.unit,
        isCustomizable: input.isCustomizable,
        status: input.status,
      },
    });

    if (input.imageUrl !== undefined) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.imageUrl) {
        await tx.productImage.create({
          data: { productId: id, url: input.imageUrl, isPrimary: true, order: 0 },
        });
      }
    }

    return product;
  });
}

export async function toggleProductStatus(id: string) {
  const product = await db.product.findUniqueOrThrow({ where: { id } });
  return db.product.update({
    where: { id },
    data: { status: product.status === "ACTIVO" ? "INACTIVO" : "ACTIVO" },
  });
}

export async function deleteProduct(id: string) {
  const [saleItems, purchaseItems, orderItems] = await Promise.all([
    db.saleItem.count({ where: { productId: id } }),
    db.purchaseItem.count({ where: { productId: id } }),
    db.orderItem.count({ where: { productId: id } }),
  ]);

  if (saleItems > 0 || purchaseItems > 0 || orderItems > 0) {
    throw new Error(
      "No puedes eliminar este producto porque tiene historial de ventas, compras o pedidos. Desactívalo en su lugar.",
    );
  }

  return db.product.delete({ where: { id } });
}

export async function getLowStockProducts() {
  const products = await db.product.findMany({
    where: { status: "ACTIVO" },
    include: { category: { select: { name: true } } },
    orderBy: { stock: "asc" },
  });
  return products.filter((p) => p.stock <= p.minStock);
}
