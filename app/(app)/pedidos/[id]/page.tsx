"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { formatCurrency } from "@/lib/currency";
import {
  orderStatusFlow,
  orderStatusLabels,
  customOrderStatusFlow,
  customOrderStatusLabels,
} from "@/lib/order-labels";
import type { OrderStatus, CustomOrderStatus } from "@prisma/client";

interface OrderDetail {
  id: string;
  code: string;
  status: OrderStatus;
  customStatus: CustomOrderStatus | null;
  isCustom: boolean;
  total: string;
  deposit: string;
  balance: string;
  message: string | null;
  address: string | null;
  reference: string | null;
  deliveryDate: string | null;
  deliveryTime: string | null;
  paymentMethod: string | null;
  customText: string | null;
  customColor: string | null;
  customReference: string | null;
  customImageUrl: string | null;
  customDesignUrl: string | null;
  customer: { name: string; phone: string | null; whatsapp: string | null };
  items: { id: string; name: string; quantity: number; price: string; total: string }[];
  delivery: { id: string; status: string; courierName: string | null } | null;
  createdAt: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [updating, setUpdating] = useState(false);
  const toast = useToast();

  const load = () => {
    fetch(`/api/pedidos/${id}`)
      .then((res) => res.json())
      .then(setOrder);
  };

  useEffect(load, [id]);

  if (!order) {
    return (
      <div className="p-6 sm:p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const cancelled = order.status === "CANCELADO";
  const currentIndex = order.isCustom
    ? customOrderStatusFlow.indexOf(order.customStatus ?? "DISENO_PENDIENTE")
    : orderStatusFlow.indexOf(order.status);

  const advanceStatus = async (index: number) => {
    setUpdating(true);
    const payload = order.isCustom
      ? { customStatus: customOrderStatusFlow[index] }
      : { status: orderStatusFlow[index] };
    const { error } = await apiRequest(`/api/pedidos/${id}/estado`, { method: "POST", body: JSON.stringify(payload) });
    setUpdating(false);
    if (error) {
      toast({ variant: "danger", title: "No se pudo actualizar el estado", description: error });
      return;
    }
    load();
  };

  const cancelOrder = async () => {
    setUpdating(true);
    const { error } = await apiRequest(`/api/pedidos/${id}/estado`, {
      method: "POST",
      body: JSON.stringify({ status: "CANCELADO" }),
    });
    setUpdating(false);
    if (error) {
      toast({ variant: "danger", title: "No se pudo cancelar el pedido", description: error });
      return;
    }
    toast({ variant: "success", title: "Pedido cancelado" });
    load();
  };

  return (
    <div className="p-6 sm:p-8">
      <Link href="/pedidos" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary">
        <ArrowLeft className="size-3.5" />
        Volver a pedidos
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">{order.code}</h1>
            {order.isCustom && <Badge variant="accent">Personalizado</Badge>}
          </div>
          <p className="text-[13px] text-text-secondary">
            {order.customer.name} {order.customer.phone && `· ${order.customer.phone}`}
          </p>
        </div>
        {!cancelled && order.status !== "ENTREGADO" && (
          <Button variant="secondary" className="text-danger" onClick={cancelOrder}>
            Cancelar pedido
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          {cancelled ? (
            <Badge variant="danger">Pedido cancelado</Badge>
          ) : (
            <OrderTimeline
              steps={
                order.isCustom
                  ? customOrderStatusFlow.map((s) => ({ key: s, label: customOrderStatusLabels[s] }))
                  : orderStatusFlow.map((s) => ({ key: s, label: orderStatusLabels[s] }))
              }
              currentIndex={currentIndex}
              onStepClick={advanceStatus}
              disabled={updating}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-4 text-[15px] font-semibold text-text-primary">Productos</h2>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-[13px]">
                    <span className="text-text-primary">{item.quantity}× {item.name}</span>
                    <span className="font-medium text-text-primary">{formatCurrency(Number(item.total))}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total</span>
                  <span className="font-medium text-text-primary">{formatCurrency(Number(order.total))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Adelanto</span>
                  <span className="font-medium text-success">{formatCurrency(Number(order.deposit))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Saldo pendiente</span>
                  <span className="font-medium text-warning">{formatCurrency(Number(order.balance))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.isCustom && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Detalles de personalización</h2>
                <div className="space-y-2 text-[13px]">
                  {order.customText && <p><span className="text-text-secondary">Texto:</span> {order.customText}</p>}
                  {order.customColor && <p><span className="text-text-secondary">Color:</span> {order.customColor}</p>}
                  {order.customReference && <p><span className="text-text-secondary">Referencia:</span> {order.customReference}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-3 text-[15px] font-semibold text-text-primary">Entrega</h2>
              <div className="space-y-1.5 text-[13px] text-text-secondary">
                <p>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("es-PE", { dateStyle: "medium" }) : "Sin fecha"} {order.deliveryTime && `· ${order.deliveryTime}`}</p>
                <p>{order.address || "Sin dirección (recojo en tienda)"}</p>
                {order.reference && <p>Ref: {order.reference}</p>}
              </div>
              {order.delivery ? (
                <div className="mt-3 rounded-[10px] bg-bg px-3 py-2 text-[12.5px]">
                  <span className="inline-flex items-center gap-1.5 text-text-primary">
                    <Truck className="size-3.5" /> {order.delivery.courierName || "Sin repartidor asignado"}
                  </span>
                </div>
              ) : (
                order.address && (
                  <Link href={`/delivery?orderId=${order.id}`}>
                    <Button variant="secondary" size="sm" className="mt-3">
                      <Truck className="size-4" />
                      Programar delivery
                    </Button>
                  </Link>
                )
              )}
            </CardContent>
          </Card>

          {order.message && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="mb-2 text-[15px] font-semibold text-text-primary">Mensaje</h2>
                <p className="text-[13px] text-text-secondary">{order.message}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
