"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingBag, Plus, Trash2 } from "lucide-react";
import { createPurchaseSchema, type CreatePurchaseInput } from "@/schemas/purchase";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/currency";

interface SupplierOption {
  id: string;
  company: string;
}
interface ProductOption {
  id: string;
  name: string;
  cost: string;
}

interface PurchaseRow {
  id: string;
  code: string;
  total: string;
  notes: string | null;
  createdAt: string;
  supplier: { company: string };
  user: { name: string };
  items: { id: string }[];
}

export default function ComprasPage() {
  const [data, setData] = useState({ items: [] as PurchaseRow[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    fetch(`/api/compras?page=${page}&pageSize=20`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  useEffect(() => {
    fetch("/api/proveedores")
      .then((res) => res.json())
      .then(setSuppliers);
    fetch("/api/productos?pageSize=200")
      .then((res) => res.json())
      .then((d) => setProducts(d.items ?? []));
  }, []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePurchaseInput>({
    resolver: zodResolver(createPurchaseSchema),
    defaultValues: { supplierId: "", items: [{ productId: "", quantity: 1, cost: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const total = items.reduce((sum, i) => sum + (Number(i.cost) || 0) * (Number(i.quantity) || 0), 0);

  const openCreate = () => {
    reset({ supplierId: "", items: [{ productId: "", quantity: 1, cost: 0 }], notes: "" });
    setModalOpen(true);
  };

  const onSubmit = async (values: CreatePurchaseInput) => {
    const { error } = await apiRequest("/api/compras", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo registrar la compra", description: error });
      return;
    }
    toast({ variant: "success", title: "Compra registrada", description: "El inventario se actualizó automáticamente." });
    setModalOpen(false);
    load();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Compras</h1>
          <p className="text-[13px] text-text-secondary">{data.total} compras registradas.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva compra
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No tienes compras registradas."
          description="Registra tu primera compra a un proveedor para actualizar tu inventario."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nueva compra</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Registrado por</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell className="font-medium">{purchase.code}</TableCell>
                <TableCell className="text-text-secondary">{purchase.supplier.company}</TableCell>
                <TableCell>{purchase.items.length}</TableCell>
                <TableCell className="font-medium">{formatCurrency(Number(purchase.total))}</TableCell>
                <TableCell className="text-text-secondary">{purchase.user.name}</TableCell>
                <TableCell className="text-text-secondary">
                  {new Date(purchase.createdAt).toLocaleDateString("es-PE", { dateStyle: "medium" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} totalItems={data.total} pageSize={20} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva compra"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Confirmar compra</Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Proveedor"
            options={suppliers.map((s) => ({ value: s.id, label: s.company }))}
            placeholder="Selecciona un proveedor"
            error={errors.supplierId?.message}
            {...register("supplierId")}
          />

          <div>
            <p className="mb-2 text-[13px] font-medium text-text-primary">Productos</p>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-wrap items-end gap-2">
                  <Select
                    options={products.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="Producto"
                    value={items[index]?.productId ?? ""}
                    onChange={(e) => {
                      const product = products.find((p) => p.id === e.target.value);
                      setValue(`items.${index}.productId`, e.target.value);
                      if (product) setValue(`items.${index}.cost`, Number(product.cost));
                    }}
                    className="min-w-[180px] flex-1"
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    className="w-24 shrink-0"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Costo unit."
                    className="w-28 shrink-0"
                    {...register(`items.${index}.cost`, { valueAsNumber: true })}
                  />
                  <Button
                    variant="icon"
                    size="iconMd"
                    className="shrink-0 hover:text-danger"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label="Quitar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => append({ productId: "", quantity: 1, cost: 0 })}>
              <Plus className="size-4" />
              Agregar producto
            </Button>
            {errors.items?.message && <p className="mt-1 text-[12px] text-danger">{errors.items.message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-[12px] bg-bg px-4 py-3">
            <span className="text-[13px] font-medium text-text-primary">Total de la compra</span>
            <span className="text-[15px] font-semibold text-text-primary">{formatCurrency(total)}</span>
          </div>

          <Textarea label="Notas (opcional)" {...register("notes")} />
        </form>
      </Modal>
    </div>
  );
}
