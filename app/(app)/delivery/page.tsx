"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Truck, Plus, MapPin } from "lucide-react";
import {
  createDeliverySchema,
  type CreateDeliveryInput,
  type CreateDeliveryFormValues,
} from "@/schemas/delivery";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { deliveryStatusLabels } from "@/lib/order-labels";
import { formatCurrency } from "@/lib/currency";
import type { DeliveryStatus } from "@prisma/client";

interface DeliveryRow {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  reference: string | null;
  date: string;
  time: string | null;
  courierName: string | null;
  cost: string;
  status: DeliveryStatus;
  order: { code: string; isCustom: boolean };
}

interface AvailableOrder {
  id: string;
  code: string;
  address: string | null;
  reference: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  customer: { name: string; phone: string | null };
}

const statusOrder: DeliveryStatus[] = ["PENDIENTE", "EN_CAMINO", "ENTREGADO"];

function DeliveryPageInner() {
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get("orderId");

  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/delivery?${params}`)
      .then((res) => res.json())
      .then(setDeliveries)
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  useEffect(() => {
    if (preselectedOrderId) setModalOpen(true);
  }, [preselectedOrderId]);

  useEffect(() => {
    if (!modalOpen) return;
    fetch("/api/delivery?availableOrders=true")
      .then((res) => res.json())
      .then(setAvailableOrders);
  }, [modalOpen]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateDeliveryFormValues, unknown, CreateDeliveryInput>({
    resolver: zodResolver(createDeliverySchema),
    defaultValues: { cost: 0 },
  });

  useEffect(() => {
    if (modalOpen && preselectedOrderId && availableOrders.length > 0) {
      applyOrder(preselectedOrderId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableOrders, modalOpen]);

  const applyOrder = (orderId: string) => {
    const order = availableOrders.find((o) => o.id === orderId);
    if (!order) return;
    setValue("orderId", order.id);
    setValue("customerName", order.customer.name);
    setValue("phone", order.customer.phone ?? "");
    setValue("address", order.address ?? "");
    setValue("reference", order.reference ?? "");
    setValue("date", order.deliveryDate ? order.deliveryDate.slice(0, 10) : "");
    setValue("time", order.deliveryTime ?? "");
  };

  const openCreate = () => {
    reset({ orderId: "", customerName: "", phone: "", address: "", reference: "", date: "", time: "", courierName: "", cost: 0 });
    setModalOpen(true);
  };

  const onSubmit = async (values: CreateDeliveryInput) => {
    const { error } = await apiRequest("/api/delivery", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo crear el delivery", description: error });
      return;
    }
    toast({ variant: "success", title: "Delivery programado" });
    setModalOpen(false);
    load();
  };

  const updateStatus = async (id: string, status: DeliveryStatus) => {
    const { error } = await apiRequest(`/api/delivery/${id}/estado`, { method: "POST", body: JSON.stringify({ status }) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo actualizar", description: error });
      return;
    }
    load();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Delivery</h1>
          <p className="text-[13px] text-text-secondary">Coordina las entregas de tus pedidos.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo delivery
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${statusFilter === "" ? "bg-accent text-white" : "bg-bg text-text-secondary hover:text-text-primary"}`}
        >
          Todos
        </button>
        {statusOrder.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${statusFilter === s ? "bg-accent text-white" : "bg-bg text-text-secondary hover:text-text-primary"}`}
          >
            {deliveryStatusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : deliveries.length === 0 ? (
        <EmptyState icon={Truck} title="No tienes deliveries programados." />
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-text-primary">{d.order.code}</p>
                    <Badge variant={d.status === "ENTREGADO" ? "success" : d.status === "EN_CAMINO" ? "info" : "warning"}>
                      {deliveryStatusLabels[d.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-text-primary">{d.customerName} · {d.phone}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-text-secondary">
                    <MapPin className="size-3.5" /> {d.address}
                  </p>
                  <p className="mt-0.5 text-[12px] text-text-secondary">
                    {new Date(d.date).toLocaleDateString("es-PE", { dateStyle: "medium" })} {d.time && `· ${d.time}`}
                    {d.courierName && ` · ${d.courierName}`}
                    {Number(d.cost) > 0 && ` · Costo: ${formatCurrency(Number(d.cost))}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {d.status === "PENDIENTE" && (
                    <Button size="sm" variant="secondary" onClick={() => updateStatus(d.id, "EN_CAMINO")}>
                      Marcar en camino
                    </Button>
                  )}
                  {d.status === "EN_CAMINO" && (
                    <Button size="sm" onClick={() => updateStatus(d.id, "ENTREGADO")}>
                      Marcar entregado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo delivery"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Programar</Button>
          </>
        }
      >
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Pedido"
            className="sm:col-span-2"
            options={availableOrders.map((o) => ({ value: o.id, label: `${o.code} — ${o.customer.name}` }))}
            placeholder="Selecciona un pedido"
            error={errors.orderId?.message}
            {...register("orderId", { onChange: (e) => applyOrder(e.target.value) })}
          />
          <Input label="Cliente" error={errors.customerName?.message} {...register("customerName")} />
          <Input label="Teléfono" error={errors.phone?.message} {...register("phone")} />
          <Input label="Dirección" className="sm:col-span-2" error={errors.address?.message} {...register("address")} />
          <Input label="Referencia" {...register("reference")} />
          <Input label="Repartidor" {...register("courierName")} />
          <Input label="Fecha" type="date" error={errors.date?.message} {...register("date")} />
          <Input label="Hora" type="time" {...register("time")} />
          <Input label="Costo de envío (S/)" type="number" step="0.01" min="0" {...register("cost")} />
        </form>
      </Modal>
    </div>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense>
      <DeliveryPageInner />
    </Suspense>
  );
}
