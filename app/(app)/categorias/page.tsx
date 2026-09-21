"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { categorySchema, type CategoryInput } from "@/schemas/category";
import { useCrudList, apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useIsAdmin } from "@/components/layout/UserContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  _count: { products: number };
}

export default function CategoriasPage() {
  const { items, loading, refresh, setItems } = useCrudList<CategoryRow>("/api/categorias");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = useIsAdmin();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({ resolver: zodResolver(categorySchema), defaultValues: { active: true } });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", description: "", active: true });
    setModalOpen(true);
  };

  const openEdit = (category: CategoryRow) => {
    setEditing(category);
    reset({ name: category.name, description: category.description ?? "", active: category.active });
    setModalOpen(true);
  };

  const onSubmit = async (values: CategoryInput) => {
    const { error } = editing
      ? await apiRequest(`/api/categorias/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) })
      : await apiRequest("/api/categorias", { method: "POST", body: JSON.stringify(values) });

    if (error) {
      toast({ variant: "danger", title: "No se pudo guardar la categoría", description: error });
      return;
    }
    toast({ variant: "success", title: editing ? "Categoría actualizada" : "Categoría creada" });
    setModalOpen(false);
    refresh();
  };

  const handleDelete = async (category: CategoryRow) => {
    const confirmed = await confirm({
      title: `¿Eliminar "${category.name}"?`,
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!confirmed) return;

    const { error } = await apiRequest(`/api/categorias/${category.id}`, { method: "DELETE" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo eliminar", description: error });
      return;
    }
    toast({ variant: "success", title: "Categoría eliminada" });
    setItems((prev) => prev.filter((c) => c.id !== category.id));
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Categorías</h1>
          <p className="text-[13px] text-text-secondary">Organiza tu catálogo de productos.</p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nueva categoría
          </Button>
        )}
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={4} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No tienes categorías todavía."
          description="Crea tu primera categoría para comenzar a organizar tus productos."
          action={isAdmin && <Button onClick={openCreate}><Plus className="size-4" />Agregar categoría</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Estado</TableHead>
              {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-text-secondary">{category.description || "—"}</TableCell>
                <TableCell>{category._count.products}</TableCell>
                <TableCell>
                  <Badge variant={category.active ? "success" : "neutral"}>
                    {category.active ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="icon" size="iconSm" onClick={() => openEdit(category)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="icon"
                        size="iconSm"
                        onClick={() => handleDelete(category)}
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

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar categoría" : "Nueva categoría"}
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
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nombre" error={errors.name?.message} {...register("name")} />
          <Textarea label="Descripción (opcional)" error={errors.description?.message} {...register("description")} />
          <label className="flex items-center gap-2.5 text-[13px] font-medium text-text-primary">
            <input type="checkbox" className="size-4 rounded border-border accent-[color:var(--color-accent)]" {...register("active")} />
            Categoría activa
          </label>
        </form>
      </Modal>
    </div>
  );
}
