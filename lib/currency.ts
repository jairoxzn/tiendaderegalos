const formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a number/Decimal-like value as Peruvian soles, e.g. `S/ 1,250.00`. */
export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  return formatter.format(Number.isFinite(num) ? num : 0);
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return 0;
}
