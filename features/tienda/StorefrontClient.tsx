"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Gift, MessageCircle } from "lucide-react";
import { StorefrontHeader } from "@/features/tienda/StorefrontHeader";
import { CategoryNav } from "@/features/tienda/CategoryNav";
import { HeroBanner } from "@/features/tienda/HeroBanner";
import { FilterSidebar, type SortOption } from "@/features/tienda/FilterSidebar";
import { TrustSidebar } from "@/features/tienda/TrustSidebar";
import { StorefrontProductCard } from "@/features/tienda/StorefrontProductCard";
import { CartDrawer } from "@/features/tienda/CartDrawer";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLocalCart } from "@/hooks/useLocalCart";
import { useFavorites } from "@/hooks/useFavorites";
import type { StorefrontProduct, StorefrontCategory } from "@/features/tienda/types";

export function StorefrontClient({
  storeName,
  logoUrl,
  address,
  whatsapp,
  categories,
  products,
}: {
  storeName: string;
  logoUrl?: string | null;
  address?: string | null;
  whatsapp?: string | null;
  categories: StorefrontCategory[];
  products: StorefrontProduct[];
}) {
  const maxPrice = useMemo(
    () => Math.max(10, Math.ceil(Math.max(0, ...products.map((p) => p.price)) / 10) * 10),
    [products],
  );

  const [search, setSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [priceLimit, setPriceLimit] = useState(maxPrice);
  const [sort, setSort] = useState<SortOption>("recientes");
  const [favoritesActive, setFavoritesActive] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const cart = useLocalCart();
  const favorites = useFavorites();

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectSingleCategory = (id: string | null) => {
    setSelectedCategoryIds(id ? [id] : []);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategoryIds([]);
    setPriceLimit(maxPrice);
    setSort("recientes");
    setFavoritesActive(false);
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (favoritesActive) list = list.filter((p) => favorites.isFavorite(p.id));
    if (selectedCategoryIds.length > 0) list = list.filter((p) => selectedCategoryIds.includes(p.categoryId));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q));
    }
    list = list.filter((p) => p.price <= priceLimit);

    const sorted = [...list];
    switch (sort) {
      case "precio-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "precio-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "nombre":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [products, favoritesActive, favorites, selectedCategoryIds, search, priceLimit, sort]);

  const handleAddToCart = (product: StorefrontProduct) => {
    cart.add({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl });
    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId((current) => (current === product.id ? null : current)), 1500);
  };

  const activeCategoryTop = selectedCategoryIds.length === 1 ? selectedCategoryIds[0] : null;
  const sectionTitle = favoritesActive
    ? "Tus favoritos"
    : selectedCategoryIds.length === 1
      ? categories.find((c) => c.id === selectedCategoryIds[0])?.name ?? "Productos"
      : "Todos los productos";

  const filterSidebarProps = {
    categories,
    selectedCategoryIds,
    onToggleCategory: toggleCategory,
    maxPrice,
    priceLimit,
    onPriceLimitChange: setPriceLimit,
    sort,
    onSortChange: setSort,
    onClear: clearFilters,
  };

  return (
    <div className="min-h-dvh bg-bg">
      <StorefrontHeader
        storeName={storeName}
        logoUrl={logoUrl}
        search={search}
        onSearchChange={setSearch}
        favoritesCount={favorites.count}
        favoritesActive={favoritesActive}
        onToggleFavoritesView={() => setFavoritesActive((v) => !v)}
        cartCount={cart.count}
        onOpenCart={() => setCartOpen(true)}
      />

      <CategoryNav categories={categories} activeId={activeCategoryTop} onSelect={selectSingleCategory} />

      {!favoritesActive && <HeroBanner storeName={storeName} address={address} />}

      <main id="catalogo-productos" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="hidden lg:block">
            <FilterSidebar {...filterSidebarProps} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[22px] font-semibold tracking-tight text-text-primary">{sectionTitle}</h2>
                <span className="rounded-full bg-bg px-2.5 py-1 text-[12px] font-medium text-text-secondary">
                  {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
                </span>
              </div>
              <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="size-3.5" />
                Filtros
              </Button>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={Gift}
                title="No encontramos productos con estos filtros."
                description="Prueba con otra categoría o limpia los filtros."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <StorefrontProductCard
                    key={product.id}
                    product={product}
                    favorite={favorites.isFavorite(product.id)}
                    onToggleFavorite={() => favorites.toggle(product.id)}
                    onAddToCart={() => handleAddToCart(product)}
                    justAdded={justAddedId === product.id}
                  />
                ))}
              </div>
            )}
          </div>

          <TrustSidebar />
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-[12px] text-text-secondary">
        {storeName} {address && `· ${address}`}
      </footer>

      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filtrar productos">
        <FilterSidebar {...filterSidebarProps} />
      </Drawer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cart.lines}
        total={cart.total}
        setQuantity={cart.setQuantity}
        remove={cart.remove}
        whatsappNumber={whatsapp}
        storeName={storeName}
      />

      {cart.count === 0 && (
        <a
          href={`https://wa.me/${(whatsapp || "").replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-20 flex size-14 items-center justify-center rounded-full bg-success text-white shadow-[var(--shadow-elevated)] transition-transform hover:scale-105 lg:hidden"
          aria-label="Escríbenos por WhatsApp"
        >
          <MessageCircle className="size-6" />
        </a>
      )}
    </div>
  );
}
