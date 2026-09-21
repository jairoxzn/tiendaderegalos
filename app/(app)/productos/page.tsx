"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Package, LayoutGrid, List, Power } from "lucide-react";
import { createProductSchema, type CreateProductInput, type CreateProductFormValues } from "@/schemas/product";
import { useCrudList, apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useIsAdmin } from "@/components/layout/UserContext";
import { Button } from "@/components/ui/Button";
import { Input, SearchInput } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProductGrid } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { FileUpload } from "@/components/ui/FileUpload";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductStatus } from "@/components/product/ProductStatus";
import { ProductPrice } from "@/components/product/ProductPrice";
import { formatCurrency } from "@/lib/currency";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  cost: string;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  minStock: number;
  unit: string;
  isCustomizable: boolean;
  status: "ACTIVO" | "INACTIVO";
  category: { id: string; name: string };
  images: { url: string }[];
}

interface ProductsResponse {
  items: ProductRow[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ProductosPage() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);

  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = useIsAdmin();

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("categoryId", categoryFilter);
    params.set("page", String(page));
    params.set("pageSize", "20");
    return params.toString();
  }, [search, categoryFilter, page]);

  const { items: categories } = useCrudList<CategoryOption>("/api/categorias");
  const [productsData, setProductsData] = useState<ProductsResponse>({ items: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = () => setRefreshTick((t) => t + 1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/productos?${query}`)
      .then((res) => res.json())
      .then((data: ProductsResponse) => {
        if (!cancelled) setProductsData(data);
      })
      .catch(() => {
        if (!cancelled) toast({ variant: "danger", title: "No se pudieron cargar los productos" });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, refreshTick]);

  const products = productsData.items;
  const total = productsData.total;
  const totalPages = productsData.totalPages;

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues, unknown, CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      unit: "UNIDAD",
      status: "ACTIVO",
      isCustomizable: false,
      stock: 0,
      minStock: 0,
    },
  });

  const imageUrl = watch("imageUrl");

  const openCreate = () => {
    setEditing(null);
    reset({
      sku: "",
      name: "",
      categoryId: categories[0]?.id ?? "",
      description: "",
      cost: 0,
      price: 0,
      compareAtPrice: 0,
      stock: 0,
      minStock: 0,
      unit: "UNIDAD",
      isCustomizable: false,
      status: "ACTIVO",
      imageUrl: null,
    });
    setModalOpen(true);
  };

  const openEdit = (product: ProductRow) => {
    setEditing(product);
    reset({
      sku: product.sku,
      name: product.name,
      categoryId: product.category.id,
      description: product.description ?? "",
      cost: Number(product.cost),
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : 0,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      isCustomizable: product.isCustomizable,
      status: product.status,
      imageUrl: product.images[0]?.url ?? null,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CreateProductInput) => {
    const payload = editing ? { ...values, stock: undefined } : values;
    const { error } = editing
      ? await apiRequest(`/api/productos/${editing.id}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await apiRequest("/api/productos", { method: "POST", body: JSON.stringify(payload) });

    if (error) {
      toast({ variant: "danger", title: "No se pudo guardar el producto", description: error });
      return;
    }
    toast({ variant: "success", title: editing ? "Producto actualizado" : "Producto creado" });
    setModalOpen(false);
    refresh();
  };

  const handleToggle = async (product: ProductRow) => {
    const { error } = await apiRequest(`/api/productos/${product.id}/toggle`, { method: "POST" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo cambiar el estado", description: error });
      return;
    }
    refresh();
  };

  const handleDelete = async (product: ProductRow) => {
    const confirmed = await confirm({
      title: `¿Eliminar "${product.name}"?`,
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!confirmed) return;

    const { error } = await apiRequest(`/api/productos/${product.id}`, { method: "DELETE" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo eliminar", description: error });
      return;
    }
    toast({ variant: "success", title: "Producto eliminado" });
    refresh();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Productos</h1>
          <p className="text-[13px] text-text-secondary">{total} productos en tu catálogo.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nuevo producto
          </Button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Buscar por nombre o SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          options={[{ value: "", label: "Todas las categorías" }, ...categoryOptions]}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="max-w-[220px]"
        />
        <div className="ml-auto flex items-center gap-1 rounded-[12px] bg-bg p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="iconSm"
            onClick={() => setView("grid")}
            aria-label="Vista de cuadrícula"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="iconSm"
            onClick={() => setView("table")}
            aria-label="Vista de tabla"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <SkeletonProductGrid count={10} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No tienes productos todavía."
          description="Agrega tu primer producto para comenzar a vender."
          action={isAdmin && <Button onClick={openCreate}><Plus className="size-4" />Agregar producto</Button>}
        />
      ) : view === "grid" ? (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                cost: product.cost,
                stock: product.stock,
                minStock: product.minStock,
                status: product.status,
                categoryName: product.category.name,
                imageUrl: product.images[0]?.url,
              }}
              onClick={isAdmin ? () => openEdit(product) : undefined}
            />
          ))}
        </ProductGrid>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProductImage src={product.images[0]?.url} alt={product.name} className="size-10 shrink-0" sizes="40px" />
                    <span className="font-medium">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-text-secondary">{product.sku}</TableCell>
                <TableCell className="text-text-secondary">{product.category.name}</TableCell>
                <TableCell>
                  <ProductPrice price={product.price} />
                </TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <ProductStatus status={product.status} stock={product.stock} minStock={product.minStock} />
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="icon" size="iconSm" onClick={() => handleToggle(product)} aria-label="Activar/desactivar">
                        <Power className="size-4" />
                      </Button>
                      <Button variant="icon" size="iconSm" onClick={() => openEdit(product)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="icon"
                        size="iconSm"
                        onClick={() => handleDelete(product)}
                        aria-label="Eliminar"
                        className="hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={total} pageSize={20} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar producto" : "Nuevo producto"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              Guardar
            </Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <FileUpload
            value={imageUrl}
            onChange={(url) => setValue("imageUrl", url)}
            label="Imagen del producto"
            className="sm:col-span-2"
          />
          <Input label="SKU" error={errors.sku?.message} {...register("sku")} />
          <Input label="Nombre" error={errors.name?.message} {...register("name")} />
          <Select
            label="Categoría"
            options={categoryOptions}
            placeholder="Selecciona una categoría"
            error={errors.categoryId?.message}
            {...register("categoryId")}
          />
          <Select
            label="Estado"
            options={[
              { value: "ACTIVO", label: "Activo" },
              { value: "INACTIVO", label: "Inactivo" },
            ]}
            {...register("status")}
          />
          <Input label="Costo (S/)" type="number" step="0.01" min="0" error={errors.cost?.message} {...register("cost")} />
          <Input label="Precio de venta (S/)" type="number" step="0.01" min="0" error={errors.price?.message} {...register("price")} />
          <Input
            label="Precio anterior / oferta (S/)"
            type="number"
            step="0.01"
            min="0"
            hint="Opcional. Si es mayor al precio de venta, se muestra tachado con descuento en el catálogo."
            error={errors.compareAtPrice?.message}
            {...register("compareAtPrice")}
          />
          {!editing && (
            <Input label="Stock inicial" type="number" min="0" error={errors.stock?.message} {...register("stock")} />
          )}
          <Input label="Stock mínimo" type="number" min="0" error={errors.minStock?.message} {...register("minStock")} />
          <Input label="Unidad" hint="Ej: UNIDAD, PAQUETE, KG" error={errors.unit?.message} {...register("unit")} />
          <label className="flex items-center gap-2.5 self-end pb-2.5 text-[13px] font-medium text-text-primary">
            <input type="checkbox" className="size-4 rounded border-border accent-[color:var(--color-accent)]" {...register("isCustomizable")} />
            Producto personalizable
          </label>
          <Textarea
            label="Descripción (opcional)"
            className="sm:col-span-2"
            error={errors.description?.message}
            {...register("description")}
          />
        </form>
      </Modal>
    </div>
  );
}
