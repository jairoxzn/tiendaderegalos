"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { promotionSchema, type PromotionInput, type PromotionFormValues } from "@/schemas/promotion";
import { useCrudList, apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonProductGrid } from "@/components/ui/Skeleton";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/currency";

interface ProductOption {
  id: string;
  name: string;
}

interface PromotionRow {
  id: string;
  name: string;
  description: string | null;
  price: string;
  startDate: string;
  endDate: string;
  status: "ACTIVA" | "INACTIVA";
  items: { id: string; quantity: number; product: { name: string } }[];
}

export default function PromocionesPage() {
  const { items, loading, refresh, setItems } = useCrudList<PromotionRow>("/api/promociones");
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromotionRow | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    fetch("/api/productos?pageSize=200&status=ACTIVO")
      .then((res) => res.json())
      .then((d) => setProducts(d.items ?? []));
  }, []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormValues, unknown, PromotionInput>({
    resolver: zodResolver(promotionSchema),
    defaultValues: { status: "ACTIVA", items: [{ productId: "", quantity: 1 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", description: "", price: 0, startDate: "", endDate: "", status: "ACTIVA", items: [{ productId: "", quantity: 1 }] });
    setModalOpen(true);
  };

  const openEdit = (promotion: PromotionRow) => {
    setEditing(promotion);
    reset({
      name: promotion.name,
      description: promotion.description ?? "",
      price: Number(promotion.price),
      startDate: promotion.startDate.slice(0, 10),
      endDate: promotion.endDate.slice(0, 10),
      status: promotion.status,
      items: promotion.items.map((i) => ({ productId: "", quantity: i.quantity })),
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: PromotionInput) => {
    const { error } = editing
      ? await apiRequest(`/api/promociones/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) })
      : await apiRequest("/api/promociones", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo guardar la promoción", description: error });
      return;
    }
    toast({ variant: "success", title: editing ? "Promoción actualizada" : "Promoción creada" });
    setModalOpen(false);
    refresh();
  };

  const handleDelete = async (promotion: PromotionRow) => {
    const confirmed = await confirm({ title: `¿Eliminar "${promotion.name}"?`, confirmLabel: "Eliminar", danger: true });
    if (!confirmed) return;
    const { error } = await apiRequest(`/api/promociones/${promotion.id}`, { method: "DELETE" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo eliminar", description: error });
      return;
    }
    toast({ variant: "success", title: "Promoción eliminada" });
    setItems((prev) => prev.filter((p) => p.id !== promotion.id));
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Promociones</h1>
          <p className="text-[13px] text-text-secondary">Crea combos y ofertas por tiempo limitado.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva promoción
        </Button>
      </div>

      {loading ? (
        <SkeletonProductGrid count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No tienes promociones todavía."
          description='Ej: "Pack Cumpleaños" — Peluche + Globo + Chocolate a un precio especial.'
          action={<Button onClick={openCreate}><Plus className="size-4" />Nueva promoción</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((promo) => (
            <Card key={promo.id}>
              <CardContent className="pt-6">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-text-primary">{promo.name}</h3>
                  <Badge variant={promo.status === "ACTIVA" ? "success" : "neutral"}>
                    {promo.status === "ACTIVA" ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <p className="mb-3 text-[13px] text-text-secondary">
                  {promo.items.map((i) => `${i.quantity}× ${i.product.name}`).join(" + ")}
                </p>
                <p className="mb-4 text-[20px] font-semibold text-accent">{formatCurrency(Number(promo.price))}</p>
                <p className="mb-4 text-[12px] text-text-secondary">
                  {new Date(promo.startDate).toLocaleDateString("es-PE")} — {new Date(promo.endDate).toLocaleDateString("es-PE")}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(promo)}>
                    <Pencil className="size-3.5" />
                    Editar
                  </Button>
                  <Button variant="secondary" size="sm" className="hover:text-danger" onClick={() => handleDelete(promo)}>
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar promoción" : "Nueva promoción"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Guardar</Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nombre" error={errors.name?.message} {...register("name")} />
          <Textarea label="Descripción (opcional)" error={errors.description?.message} {...register("description")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Precio del combo (S/)" type="number" step="0.01" min="0" error={errors.price?.message} {...register("price")} />
            <Select label="Estado" options={[{ value: "ACTIVA", label: "Activa" }, { value: "INACTIVA", label: "Inactiva" }]} {...register("status")} />
            <Input label="Fecha inicio" type="date" error={errors.startDate?.message} {...register("startDate")} />
            <Input label="Fecha final" type="date" error={errors.endDate?.message} {...register("endDate")} />
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-text-primary">Productos incluidos</p>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-wrap items-end gap-2">
                  <Select
                    options={products.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="Producto"
                    className="min-w-[180px] flex-1"
                    {...register(`items.${index}.productId`)}
                  />
                  <Input type="number" min="1" placeholder="Cant." className="w-20 shrink-0" {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                  <Button variant="icon" size="iconMd" className="shrink-0 hover:text-danger" onClick={() => remove(index)} disabled={fields.length === 1} aria-label="Quitar">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="mt-2" onClick={() => append({ productId: "", quantity: 1 })}>
              <Plus className="size-4" />
              Agregar producto
            </Button>
            {errors.items?.message && <p className="mt-1 text-[12px] text-danger">{errors.items.message}</p>}
          </div>
        </form>
      </Modal>
    </div>
  );
}
