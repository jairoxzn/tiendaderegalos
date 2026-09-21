export interface StorefrontProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  isNew: boolean;
  isBestSeller: boolean;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  count: number;
}
