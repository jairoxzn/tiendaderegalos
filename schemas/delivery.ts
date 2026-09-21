import { z } from "zod";

export const createDeliverySchema = z.object({
  orderId: z.string().min(1, "Selecciona un pedido"),
  customerName: z.string().min(1),
  phone: z.string().min(1, "Ingresa un teléfono"),
  address: z.string().min(1, "Ingresa una dirección"),
  reference: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().optional().or(z.literal("")),
  courierName: z.string().optional().or(z.literal("")),
  cost: z.coerce.number().min(0).default(0),
});

export const deliveryStatusValues = ["PENDIENTE", "EN_CAMINO", "ENTREGADO"] as const;

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type CreateDeliveryFormValues = z.input<typeof createDeliverySchema>;
