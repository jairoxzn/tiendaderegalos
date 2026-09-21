import type { Metadata } from "next";
import { MessageCircle, Gift } from "lucide-react";
import { getCatalogData } from "@/services/catalog";
import { formatCurrency } from "@/lib/currency";
import { ProductImage } from "@/components/product/ProductImage";

export const metadata: Metadata = {
  title: "Catálogo — GiftFlow",
};

function whatsappLink(whatsapp: string | null | undefined, productName: string) {
  const number = (whatsapp || "").replace(/\D/g, "");
  const text = encodeURIComponent(`Hola, quiero consultar por: ${productName}`);
  return `https://wa.me/${number}?text=${text}`;
}

export default async function TiendaPage() {
  const { settings, categories } = await getCatalogData();
  const storeName = settings?.storeName || "GiftFlow";

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-white">
            {settings?.logoUrl ? (
              <ProductImage src={settings.logoUrl} alt={storeName} className="size-10 rounded-[12px]" sizes="40px" />
            ) : (
              <Gift className="size-5" />
            )}
          </div>
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-text-primary">{storeName}</h1>
            {settings?.address && <p className="text-[12px] text-text-secondary">{settings.address}</p>}
          </div>
        </div>
        {categories.length > 0 && (
          <nav className="scrollbar-hide flex gap-2 overflow-x-auto px-5 pb-3">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#cat-${c.id}`}
                className="shrink-0 rounded-full bg-bg px-3.5 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-accent-soft hover:text-accent"
              >
                {c.name}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Gift className="mb-3 size-10 text-text-secondary/50" />
            <p className="text-[15px] font-medium text-text-primary">Todavía no hay productos publicados.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-32">
                <h2 className="mb-4 text-[20px] font-semibold tracking-tight text-text-primary">{category.name}</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {category.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)]"
                    >
                      <ProductImage
                        src={product.images[0]?.url}
                        alt={product.name}
                        className="aspect-square w-full rounded-none"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                      <div className="flex flex-1 flex-col p-3.5">
                        <p className="line-clamp-2 flex-1 text-[13.5px] font-medium text-text-primary">{product.name}</p>
                        <p className="mt-1.5 text-[15px] font-semibold text-text-primary">{formatCurrency(Number(product.price))}</p>
                        <a
                          href={whatsappLink(settings?.whatsapp, product.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center justify-center gap-1.5 rounded-[10px] bg-success px-3 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90"
                        >
                          <MessageCircle className="size-3.5" />
                          Consultar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-[12px] text-text-secondary">
        {storeName} {settings?.address && `· ${settings.address}`}
      </footer>
    </div>
  );
}
