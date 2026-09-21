"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Users, Trash2, Pencil } from "lucide-react";
import { customerSchema, type CustomerInput } from "@/schemas/customer";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useIsAdmin } from "@/components/layout/UserContext";
import { Button } from "@/components/ui/Button";
import { SearchInput, Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";

interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  dni: string | null;
  _count: { sales: number; orders: number };
}

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [] as CustomerRow[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRow | null>(null);

  const toast = useToast();
  const confirm = useConfirm();
  const isAdmin = useIsAdmin();

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    fetch(`/api/clientes?${params}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, page]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({ resolver: zodResolver(customerSchema) });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", dni: "", phone: "", whatsapp: "", email: "", address: "", birthday: "", anniversary: "", notes: "" });
    setModalOpen(true);
  };

  const openEdit = async (customer: CustomerRow) => {
    const { data: full } = await apiRequest<CustomerInput & { birthday: string | null; anniversary: string | null }>(
      `/api/clientes/${customer.id}`,
    );
    setEditing(customer);
    reset({
      name: full?.name ?? customer.name,
      dni: full?.dni ?? "",
      phone: full?.phone ?? "",
      whatsapp: full?.whatsapp ?? "",
      email: full?.email ?? "",
      address: full?.address ?? "",
      birthday: full?.birthday ? full.birthday.slice(0, 10) : "",
      anniversary: full?.anniversary ? full.anniversary.slice(0, 10) : "",
      notes: full?.notes ?? "",
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CustomerInput) => {
    const { error } = editing
      ? await apiRequest(`/api/clientes/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) })
      : await apiRequest("/api/clientes", { method: "POST", body: JSON.stringify(values) });

    if (error) {
      toast({ variant: "danger", title: "No se pudo guardar el cliente", description: error });
      return;
    }
    toast({ variant: "success", title: editing ? "Cliente actualizado" : "Cliente creado" });
    setModalOpen(false);
    load();
  };

  const handleDelete = async (customer: CustomerRow) => {
    const confirmed = await confirm({
      title: `¿Eliminar a "${customer.name}"?`,
      description: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!confirmed) return;
    const { error } = await apiRequest(`/api/clientes/${customer.id}`, { method: "DELETE" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo eliminar", description: error });
      return;
    }
    toast({ variant: "success", title: "Cliente eliminado" });
    load();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Clientes</h1>
          <p className="text-[13px] text-text-secondary">{data.total} clientes registrados.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo cliente
        </Button>
      </div>

      <div className="mb-5">
        <SearchInput
          placeholder="Buscar por nombre, teléfono o DNI..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tienes clientes todavía."
          description="Registra tu primer cliente para llevar su historial de compras."
          action={<Button onClick={openCreate}><Plus className="size-4" />Agregar cliente</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Ventas</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <Link href={`/clientes/${customer.id}`} className="hover:text-accent">
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="text-text-secondary">{customer.phone || "—"}</TableCell>
                <TableCell className="text-text-secondary">{customer.email || "—"}</TableCell>
                <TableCell>{customer._count.sales}</TableCell>
                <TableCell>{customer._count.orders}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="icon" size="iconSm" onClick={() => openEdit(customer)} aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="icon"
                        size="iconSm"
                        onClick={() => handleDelete(customer)}
                        aria-label="Eliminar"
                        className="hover:text-danger"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
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
        title={editing ? "Editar cliente" : "Nuevo cliente"}
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
          <Input label="Nombre" error={errors.name?.message} {...register("name")} />
          <Input label="DNI" error={errors.dni?.message} {...register("dni")} />
          <Input label="Teléfono" error={errors.phone?.message} {...register("phone")} />
          <Input label="WhatsApp" error={errors.whatsapp?.message} {...register("whatsapp")} />
          <Input label="Correo" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Cumpleaños" type="date" error={errors.birthday?.message} {...register("birthday")} />
          <Input label="Aniversario" type="date" error={errors.anniversary?.message} {...register("anniversary")} />
          <Input label="Dirección" className="sm:col-span-2" error={errors.address?.message} {...register("address")} />
          <Textarea label="Notas" className="sm:col-span-2" error={errors.notes?.message} {...register("notes")} />
        </form>
      </Modal>
    </div>
  );
}
