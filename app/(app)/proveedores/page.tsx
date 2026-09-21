"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, ShoppingBag } from "lucide-react";
import { supplierSchema, type SupplierInput } from "@/schemas/supplier";
import { useCrudList, apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { SearchInput, Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

interface SupplierRow {
  id: string;
  company: string;
  ruc: string | null;
  contactName: string | null;
  phone: string | null;
  active: boolean;
  _count: { purchases: number };
}

export default function ProveedoresPage() {
  const { items, loading, refresh, setItems } = useCrudList<SupplierRow>("/api/proveedores");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const filtered = items.filter((s) => s.company.toLowerCase().includes(search.toLowerCase()));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierInput>({ resolver: zodResolver(supplierSchema), defaultValues: { active: true } });

  const openCreate = () => {
    setEditing(null);
    reset({ company: "", ruc: "", contactName: "", phone: "", whatsapp: "", email: "", address: "", notes: "", active: true });
    setModalOpen(true);
  };

  const openEdit = (supplier: SupplierRow) => {
    setEditing(supplier);
    apiRequest<SupplierInput>(`/api/proveedores/${supplier.id}`).then(({ data }) => {
      if (data) reset(data);
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: SupplierInput) => {
    const { error } = editing
      ? await apiRequest(`/api/proveedores/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) })
      : await apiRequest("/api/proveedores", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo guardar el proveedor", description: error });
      return;
    }
    toast({ variant: "success", title: editing ? "Proveedor actualizado" : "Proveedor creado" });
    setModalOpen(false);
    refresh();
  };

  const handleDelete = async (supplier: SupplierRow) => {
    const confirmed = await confirm({
      title: `¿Eliminar "${supplier.company}"?`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!confirmed) return;
    const { error } = await apiRequest(`/api/proveedores/${supplier.id}`, { method: "DELETE" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo eliminar", description: error });
      return;
    }
    toast({ variant: "success", title: "Proveedor eliminado" });
    setItems((prev) => prev.filter((s) => s.id !== supplier.id));
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Proveedores</h1>
          <p className="text-[13px] text-text-secondary">{items.length} proveedores registrados.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo proveedor
        </Button>
      </div>

      <div className="mb-5">
        <SearchInput placeholder="Buscar proveedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
      </div>

      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No tienes proveedores todavía."
          description="Registra tu primer proveedor para comenzar a hacer compras."
          action={<Button onClick={openCreate}><Plus className="size-4" />Agregar proveedor</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Compras</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.company}</TableCell>
                <TableCell className="text-text-secondary">{supplier.contactName || "—"}</TableCell>
                <TableCell className="text-text-secondary">{supplier.phone || "—"}</TableCell>
                <TableCell>{supplier._count.purchases}</TableCell>
                <TableCell>
                  <Badge variant={supplier.active ? "success" : "neutral"}>{supplier.active ? "Activo" : "Inactivo"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="icon" size="iconSm" onClick={() => openEdit(supplier)} aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="icon"
                      size="iconSm"
                      onClick={() => handleDelete(supplier)}
                      aria-label="Eliminar"
                      className="hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar proveedor" : "Nuevo proveedor"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Guardar</Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Empresa" error={errors.company?.message} {...register("company")} />
          <Input label="RUC" error={errors.ruc?.message} {...register("ruc")} />
          <Input label="Contacto" error={errors.contactName?.message} {...register("contactName")} />
          <Input label="Teléfono" error={errors.phone?.message} {...register("phone")} />
          <Input label="WhatsApp" error={errors.whatsapp?.message} {...register("whatsapp")} />
          <Input label="Correo" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Dirección" className="sm:col-span-2" error={errors.address?.message} {...register("address")} />
          <Textarea label="Notas" className="sm:col-span-2" error={errors.notes?.message} {...register("notes")} />
          <label className="flex items-center gap-2.5 text-[13px] font-medium text-text-primary">
            <input type="checkbox" className="size-4 rounded border-border accent-[color:var(--color-accent)]" {...register("active")} />
            Proveedor activo
          </label>
        </form>
      </Modal>
    </div>
  );
}
