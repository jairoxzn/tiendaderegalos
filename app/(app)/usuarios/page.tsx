"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCog, Plus, Pencil, Power } from "lucide-react";
import { createUserSchema, updateUserSchema, userRoles, type CreateUserInput, type UpdateUserInput } from "@/schemas/user";
import { useCrudList, apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useCurrentUser } from "@/components/layout/UserContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "VENDEDOR";
  active: boolean;
}

export default function UsuariosPage() {
  const { items, loading, refresh, setItems } = useCrudList<UserRow>("/api/usuarios");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const toast = useToast();
  const currentUser = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(editing ? updateUserSchema : createUserSchema),
    defaultValues: { role: "VENDEDOR", active: true },
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", email: "", password: "", role: "VENDEDOR", active: true });
    setModalOpen(true);
  };

  const openEdit = (user: UserRow) => {
    setEditing(user);
    reset({ name: user.name, email: user.email, password: "", role: user.role, active: user.active });
    setModalOpen(true);
  };

  const onSubmit = async (values: CreateUserInput | UpdateUserInput) => {
    const { error } = editing
      ? await apiRequest(`/api/usuarios/${editing.id}`, { method: "PATCH", body: JSON.stringify(values) })
      : await apiRequest("/api/usuarios", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo guardar el usuario", description: error });
      return;
    }
    toast({ variant: "success", title: editing ? "Usuario actualizado" : "Usuario creado" });
    setModalOpen(false);
    refresh();
  };

  const handleToggle = async (user: UserRow) => {
    const { error } = await apiRequest(`/api/usuarios/${user.id}/toggle`, { method: "POST" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo cambiar el estado", description: error });
      return;
    }
    setItems((prev) => prev.map((u) => (u.id === user.id ? { ...u, active: !u.active } : u)));
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Usuarios</h1>
          <p className="text-[13px] text-text-secondary">Administra el acceso de tu equipo.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={5} cols={4} />
      ) : items.length === 0 ? (
        <EmptyState icon={UserCog} title="No tienes usuarios todavía." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-text-secondary">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "accent" : "neutral"}>
                    {user.role === "ADMIN" ? "Administrador" : "Vendedor"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.active ? "success" : "neutral"}>{user.active ? "Activo" : "Inactivo"}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="icon" size="iconSm" onClick={() => openEdit(user)} aria-label="Editar">
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="icon"
                      size="iconSm"
                      onClick={() => handleToggle(user)}
                      disabled={user.id === currentUser.id}
                      aria-label="Activar/desactivar"
                    >
                      <Power className="size-4" />
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
        title={editing ? "Editar usuario" : "Nuevo usuario"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Guardar</Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nombre" error={errors.name?.message} {...register("name")} />
          <Input label="Correo" type="email" error={errors.email?.message} {...register("email")} />
          <Input
            label={editing ? "Nueva contraseña (opcional)" : "Contraseña"}
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Select label="Rol" options={userRoles.map((r) => ({ value: r, label: r === "ADMIN" ? "Administrador" : "Vendedor" }))} {...register("role")} />
          <label className="flex items-center gap-2.5 text-[13px] font-medium text-text-primary">
            <input type="checkbox" className="size-4 rounded border-border accent-[color:var(--color-accent)]" {...register("active")} />
            Usuario activo
          </label>
        </form>
      </Modal>
    </div>
  );
}
