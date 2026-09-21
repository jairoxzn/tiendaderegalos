"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, Plus, Lock, ArrowUpCircle, ArrowDownCircle, History } from "lucide-react";
import {
  openRegisterSchema,
  cashMovementSchema,
  closeRegisterSchema,
  manualCashMovementTypes,
  type OpenRegisterInput,
  type OpenRegisterFormValues,
  type CashMovementInput,
  type CashMovementFormValues,
  type CloseRegisterInput,
  type CloseRegisterFormValues,
} from "@/schemas/cash-register";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/currency";

interface Movement {
  id: string;
  type: "VENTA" | "INGRESO" | "GASTO" | "RETIRO";
  amount: string;
  description: string | null;
  createdAt: string;
  user: { name: string };
}

interface OpenRegister {
  id: string;
  openingAmount: string;
  openedAt: string;
  openedBy: { name: string };
  movements: Movement[];
}

const movementLabels: Record<Movement["type"], string> = {
  VENTA: "Venta",
  INGRESO: "Ingreso",
  GASTO: "Gasto",
  RETIRO: "Retiro",
};

export default function CajaPage() {
  const [register, setRegister] = useState<OpenRegister | null | undefined>(undefined);
  const [openModal, setOpenModal] = useState(false);
  const [movementModal, setMovementModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const load = () => {
    fetch("/api/caja")
      .then((res) => res.json())
      .then(setRegister);
  };

  useEffect(load, []);

  const openForm = useForm<OpenRegisterFormValues, unknown, OpenRegisterInput>({
    resolver: zodResolver(openRegisterSchema),
    defaultValues: { openingAmount: 0 },
  });
  const movementForm = useForm<CashMovementFormValues, unknown, CashMovementInput>({
    resolver: zodResolver(cashMovementSchema),
    defaultValues: { type: "INGRESO", amount: 0, description: "" },
  });
  const closeForm = useForm<CloseRegisterFormValues, unknown, CloseRegisterInput>({
    resolver: zodResolver(closeRegisterSchema),
    defaultValues: { closingAmount: 0 },
  });

  const onOpen = async (values: OpenRegisterInput) => {
    const { error } = await apiRequest("/api/caja", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo abrir la caja", description: error });
      return;
    }
    toast({ variant: "success", title: "Caja abierta" });
    setOpenModal(false);
    load();
  };

  const onAddMovement = async (values: CashMovementInput) => {
    const { error } = await apiRequest("/api/caja/movimientos", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo registrar el movimiento", description: error });
      return;
    }
    toast({ variant: "success", title: "Movimiento registrado" });
    setMovementModal(false);
    movementForm.reset({ type: "INGRESO", amount: 0, description: "" });
    load();
  };

  const onClose = async (values: CloseRegisterInput) => {
    const confirmed = await confirm({
      title: "¿Cerrar caja?",
      description: "No podrás registrar más movimientos en esta caja una vez cerrada.",
      confirmLabel: "Cerrar caja",
      danger: true,
    });
    if (!confirmed) return;

    const { error } = await apiRequest("/api/caja/cerrar", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo cerrar la caja", description: error });
      return;
    }
    toast({ variant: "success", title: "Caja cerrada" });
    setCloseModal(false);
    load();
  };

  if (register === undefined) {
    return (
      <div className="p-6 sm:p-8">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const totals = register
    ? register.movements.reduce(
        (acc, m) => {
          const amount = Number(m.amount);
          if (m.type === "VENTA") acc.ventas += amount;
          if (m.type === "INGRESO") acc.ingresos += amount;
          if (m.type === "GASTO") acc.gastos += amount;
          if (m.type === "RETIRO") acc.retiros += amount;
          return acc;
        },
        { ventas: 0, ingresos: 0, gastos: 0, retiros: 0 },
      )
    : null;

  const expected = register && totals
    ? Number(register.openingAmount) + totals.ventas + totals.ingresos - totals.gastos - totals.retiros
    : 0;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Caja</h1>
          <p className="text-[13px] text-text-secondary">Controla la apertura, movimientos y cierre de caja.</p>
        </div>
        {register ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setMovementModal(true)}>
              <Plus className="size-4" />
              Movimiento
            </Button>
            <Button variant="danger" onClick={() => setCloseModal(true)}>
              <Lock className="size-4" />
              Cerrar caja
            </Button>
          </div>
        ) : (
          <Button onClick={() => setOpenModal(true)}>
            <Wallet className="size-4" />
            Abrir caja
          </Button>
        )}
      </div>

      {!register ? (
        <EmptyState
          icon={Wallet}
          title="No hay una caja abierta."
          description="Abre la caja para comenzar a registrar ventas y movimientos del día."
          action={<Button onClick={() => setOpenModal(true)}><Wallet className="size-4" />Abrir caja</Button>}
        />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-[12px] text-text-secondary">Monto inicial</p>
                <p className="mt-1 text-[20px] font-semibold text-text-primary">{formatCurrency(Number(register.openingAmount))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-[12px] text-text-secondary">Ventas</p>
                <p className="mt-1 text-[20px] font-semibold text-success">{formatCurrency(totals!.ventas)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-[12px] text-text-secondary">Gastos y retiros</p>
                <p className="mt-1 text-[20px] font-semibold text-danger">{formatCurrency(totals!.gastos + totals!.retiros)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-[12px] text-text-secondary">Esperado en caja</p>
                <p className="mt-1 text-[20px] font-semibold text-text-primary">{formatCurrency(expected)}</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Movimientos de hoy</h2>
          {register.movements.length === 0 ? (
            <EmptyState icon={History} title="Sin movimientos todavía." />
          ) : (
            <div className="space-y-2">
              {register.movements.map((m) => (
                <Card key={m.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      {m.type === "GASTO" || m.type === "RETIRO" ? (
                        <ArrowDownCircle className="size-4 text-danger" />
                      ) : (
                        <ArrowUpCircle className="size-4 text-success" />
                      )}
                      <div>
                        <p className="text-[13px] font-medium text-text-primary">
                          {movementLabels[m.type]} {m.description ? `· ${m.description}` : ""}
                        </p>
                        <p className="text-[12px] text-text-secondary">
                          {m.user.name} · {new Date(m.createdAt).toLocaleTimeString("es-PE", { timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[13px] font-semibold text-text-primary">{formatCurrency(Number(m.amount))}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Abrir caja"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button onClick={openForm.handleSubmit(onOpen)} loading={openForm.formState.isSubmitting}>Abrir</Button>
          </>
        }
      >
        <form onSubmit={openForm.handleSubmit(onOpen)}>
          <Input
            label="Monto inicial (S/)"
            type="number"
            step="0.01"
            min="0"
            error={openForm.formState.errors.openingAmount?.message}
            {...openForm.register("openingAmount")}
          />
        </form>
      </Modal>

      <Modal
        open={movementModal}
        onClose={() => setMovementModal(false)}
        title="Nuevo movimiento de caja"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMovementModal(false)}>Cancelar</Button>
            <Button onClick={movementForm.handleSubmit(onAddMovement)} loading={movementForm.formState.isSubmitting}>
              Registrar
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={movementForm.handleSubmit(onAddMovement)}>
          <Select
            label="Tipo"
            options={manualCashMovementTypes.map((t) => ({ value: t, label: movementLabels[t] }))}
            {...movementForm.register("type")}
          />
          <Input
            label="Monto (S/)"
            type="number"
            step="0.01"
            min="0"
            error={movementForm.formState.errors.amount?.message}
            {...movementForm.register("amount")}
          />
          <Textarea label="Descripción (opcional)" {...movementForm.register("description")} />
        </form>
      </Modal>

      <Modal
        open={closeModal}
        onClose={() => setCloseModal(false)}
        title="Cerrar caja"
        description={`Esperado en caja: ${formatCurrency(expected)}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCloseModal(false)}>Cancelar</Button>
            <Button variant="danger" onClick={closeForm.handleSubmit(onClose)} loading={closeForm.formState.isSubmitting}>
              Cerrar caja
            </Button>
          </>
        }
      >
        <form onSubmit={closeForm.handleSubmit(onClose)}>
          <Input
            label="Monto contado (S/)"
            type="number"
            step="0.01"
            min="0"
            hint="Cuenta el efectivo físico en caja e ingresa el total."
            error={closeForm.formState.errors.closingAmount?.message}
            {...closeForm.register("closingAmount")}
          />
        </form>
      </Modal>
    </div>
  );
}
