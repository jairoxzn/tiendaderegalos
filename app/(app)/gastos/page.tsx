"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Receipt, Plus, Trash2 } from "lucide-react";
import {
  expenseSchema,
  expenseCategories,
  expensePaymentMethods,
  type ExpenseInput,
  type ExpenseFormValues,
} from "@/schemas/expense";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { formatCurrency } from "@/lib/currency";

interface ExpenseRow {
  id: string;
  category: string;
  description: string;
  amount: string;
  date: string;
  paymentMethod: string;
  user: { name: string };
}

export default function GastosPage() {
  const [data, setData] = useState({ items: [] as ExpenseRow[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const load = () => {
    setLoading(true);
    fetch(`/api/gastos?page=${page}&pageSize=20`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues, unknown, ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), paymentMethod: "EFECTIVO" },
  });

  const openCreate = () => {
    reset({ category: "", description: "", amount: 0, date: new Date().toISOString().slice(0, 10), paymentMethod: "EFECTIVO" });
    setModalOpen(true);
  };

  const onSubmit = async (values: ExpenseInput) => {
    const { error } = await apiRequest("/api/gastos", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo registrar el gasto", description: error });
      return;
    }
    toast({ variant: "success", title: "Gasto registrado" });
    setModalOpen(false);
    load();
  };

  const handleDelete = async (expense: ExpenseRow) => {
    const confirmed = await confirm({ title: `¿Eliminar el gasto "${expense.description}"?`, confirmLabel: "Eliminar", danger: true });
    if (!confirmed) return;
    const { error } = await apiRequest(`/api/gastos/${expense.id}`, { method: "DELETE" });
    if (error) {
      toast({ variant: "danger", title: "No se pudo eliminar", description: error });
      return;
    }
    toast({ variant: "success", title: "Gasto eliminado" });
    load();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Gastos</h1>
          <p className="text-[13px] text-text-secondary">{data.total} gastos registrados.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo gasto
        </Button>
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={5} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No tienes gastos registrados."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nuevo gasto</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-text-secondary">
                  {new Date(expense.date).toLocaleDateString("es-PE", { dateStyle: "medium" })}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell className="text-text-secondary">{expense.description}</TableCell>
                <TableCell className="font-medium text-danger">{formatCurrency(Number(expense.amount))}</TableCell>
                <TableCell className="text-text-secondary">{expense.paymentMethod}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="icon" size="iconSm" className="hover:text-danger" onClick={() => handleDelete(expense)} aria-label="Eliminar">
                      <Trash2 className="size-4" />
                    </Button>
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
        title="Nuevo gasto"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Registrar</Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Categoría"
            options={expenseCategories.map((c) => ({ value: c, label: c }))}
            placeholder="Selecciona una categoría"
            error={errors.category?.message}
            {...register("category")}
          />
          <Input label="Descripción" error={errors.description?.message} {...register("description")} />
          <Input label="Monto (S/)" type="number" step="0.01" min="0" error={errors.amount?.message} {...register("amount")} />
          <Input label="Fecha" type="date" error={errors.date?.message} {...register("date")} />
          <Select
            label="Método de pago"
            options={expensePaymentMethods.map((m) => ({ value: m, label: m }))}
            {...register("paymentMethod")}
          />
        </form>
      </Modal>
    </div>
  );
}
