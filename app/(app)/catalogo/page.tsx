import { headers } from "next/headers";
import { getBusinessSettings } from "@/services/settings";
import { CatalogShareCards } from "@/features/catalog/CatalogShareCards";

export default async function CatalogoAdminPage() {
  const [settings, headersList] = await Promise.all([getBusinessSettings(), headers()]);
  const storeName = settings.storeName || "GiftFlow";

  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const catalogUrl = `${protocol}://${host}/tienda`;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Catálogo</h1>
        <p className="text-[13px] text-text-secondary">Comparte tu catálogo digital con tus clientes.</p>
      </div>

      <CatalogShareCards url={catalogUrl} storeName={storeName} />
    </div>
  );
}
