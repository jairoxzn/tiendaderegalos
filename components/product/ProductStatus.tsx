import { Badge } from "@/components/ui/Badge";

export function ProductStatus({ status, stock, minStock }: { status: "ACTIVO" | "INACTIVO"; stock: number; minStock: number }) {
  if (status === "INACTIVO") return <Badge variant="neutral">Inactivo</Badge>;
  if (stock <= 0) return <Badge variant="danger">Sin stock</Badge>;
  if (stock <= minStock) return <Badge variant="warning">Stock bajo</Badge>;
  return <Badge variant="success">Activo</Badge>;
}
