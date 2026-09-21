import { Badge } from "@/components/ui/Badge";
import { orderStatusLabels, orderStatusVariant, customOrderStatusLabels } from "@/lib/order-labels";
import type { OrderStatus, CustomOrderStatus } from "@prisma/client";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={orderStatusVariant(status)}>{orderStatusLabels[status]}</Badge>;
}

export function CustomOrderStatusBadge({ status }: { status: CustomOrderStatus }) {
  const variant = status === "ENTREGADO" ? "success" : status === "DISENO_PENDIENTE" ? "warning" : "info";
  return <Badge variant={variant}>{customOrderStatusLabels[status]}</Badge>;
}
