import type { Metadata } from "next";
import { getCatalogData } from "@/services/catalog";
import { StorefrontClient } from "@/features/tienda/StorefrontClient";

export const metadata: Metadata = {
  title: "Catálogo — GiftFlow",
};

export default async function TiendaPage() {
  const { settings, categories, products } = await getCatalogData();
  const storeName = settings?.storeName || "GiftFlow";

  return (
    <StorefrontClient
      storeName={storeName}
      logoUrl={settings?.logoUrl}
      address={settings?.address}
      whatsapp={settings?.whatsapp}
      categories={categories}
      products={products}
    />
  );
}
