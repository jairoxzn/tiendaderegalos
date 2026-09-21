import type { InventoryMovementType } from "@prisma/client";

export const movementTypeLabels: Record<InventoryMovementType, string> = {
  ENTRADA_COMPRA: "Entrada · Compra",
  ENTRADA_DEVOLUCION: "Entrada · Devolución",
  ENTRADA_AJUSTE: "Entrada · Ajuste",
  SALIDA_VENTA: "Salida · Venta",
  SALIDA_DANO: "Salida · Daño",
  SALIDA_PERDIDA: "Salida · Pérdida",
  SALIDA_AJUSTE: "Salida · Ajuste",
};

export const manualMovementTypeLabels: Record<string, string> = {
  ENTRADA_AJUSTE: "Entrada · Ajuste",
  ENTRADA_DEVOLUCION: "Entrada · Devolución",
  SALIDA_AJUSTE: "Salida · Ajuste",
  SALIDA_DANO: "Salida · Daño",
  SALIDA_PERDIDA: "Salida · Pérdida",
};

export function isEntrada(type: InventoryMovementType) {
  return type === "ENTRADA_COMPRA" || type === "ENTRADA_DEVOLUCION" || type === "ENTRADA_AJUSTE";
}
