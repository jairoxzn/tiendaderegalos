import type { OrderStatus, CustomOrderStatus, DeliveryStatus } from "@prisma/client";

export const orderStatusFlow: OrderStatus[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "EN_CAMINO",
  "ENTREGADO",
];

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const customOrderStatusFlow: CustomOrderStatus[] = [
  "DISENO_PENDIENTE",
  "DISENO_APROBADO",
  "EN_PRODUCCION",
  "LISTO",
  "ENTREGADO",
];

export const customOrderStatusLabels: Record<CustomOrderStatus, string> = {
  DISENO_PENDIENTE: "Diseño pendiente",
  DISENO_APROBADO: "Diseño aprobado",
  EN_PRODUCCION: "En producción",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
};

export const deliveryStatusLabels: Record<DeliveryStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_CAMINO: "En camino",
  ENTREGADO: "Entregado",
};

export function orderStatusVariant(status: OrderStatus) {
  if (status === "CANCELADO") return "danger" as const;
  if (status === "ENTREGADO") return "success" as const;
  if (status === "PENDIENTE") return "warning" as const;
  return "info" as const;
}
