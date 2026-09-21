"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Boxes, Plus, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from "lucide-react";
import { adjustStockSchema, manualMovementTypes, type AdjustStockInput, type AdjustStockFormValues } from "@/schemas/inventory";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { manualMovementTypeLabels, isEntrada } from "@/lib/inventory-labels";
import { movementTypeLabels } from "@/lib/inventory-labels";

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
  category: { name: string };
}

interface MovementRow {
  id: string;
  type: keyof typeof movementTypeLabels;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string | null;
  createdAt: string;
  product: { name: string; sku: string; unit: string };
  user: { name: string };
}

export default function InventarioPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  const [actualProducts, setActualProducts] = useState<ProductRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const refreshProducts = () => {
    setLoadingProducts(true);
    fetch("/api/productos?pageSize=200")
      .then((res) => res.json())
      .then((data) => setActualProducts(data.items ?? []))
      .finally(() => setLoadingProducts(false));
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(true);

  const loadMovements = () => {
    setLoadingMovements(true);
    fetch("/api/inventario/movimientos?pageSize=50")
      .then((res) => res.json())
      .then((data) => setMovements(data.items ?? []))
      .finally(() => setLoadingMovements(false));
  };

  useEffect(() => {
    loadMovements();
  }, []);

  const lowStock = actualProducts.filter((p) => p.stock <= p.minStock);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdjustStockFormValues, unknown, AdjustStockInput>({ resolver: zodResolver(adjustStockSchema) });

  const openModal = () => {
    reset({ productId: "", type: "ENTRADA_AJUSTE", quantity: 1, reason: "" });
    setModalOpen(true);
  };

  const onSubmit = async (values: AdjustStockInput) => {
    const { error } = await apiRequest("/api/inventario/movimientos", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo registrar el movimiento", description: error });
      return;
    }
    toast({ variant: "success", title: "Movimiento registrado" });
    setModalOpen(false);
    refreshProducts();
    loadMovements();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Inventario</h1>
          <p className="text-[13px] text-text-secondary">Controla el stock y los movimientos de tus productos.</p>
        </div>
        <Button onClick={openModal}>
          <Plus className="size-4" />
          Nuevo ajuste
        </Button>
      </div>

      {lowStock.length > 0 && (
        <Alert variant="warning" title={`${lowStock.length} producto(s) con stock bajo`} className="mb-5">
          {lowStock.slice(0, 4).map((p) => p.name).join(", ")}
          {lowStock.length > 4 && ` y ${lowStock.length - 4} más`}.
        </Alert>
      )}

      <Tabs defaultValue="stock">
        <TabsList className="mb-5">
          <TabsTrigger value="stock">Stock actual</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          {loadingProducts ? (
            <SkeletonTable rows={8} cols={5} />
          ) : actualProducts.length === 0 ? (
            <EmptyState icon={Boxes} title="No tienes productos todavía." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock disponible</TableHead>
                  <TableHead>Stock mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actualProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-text-secondary">{product.category.name}</TableCell>
                    <TableCell>
                      {product.stock} {product.unit.toLowerCase()}
                    </TableCell>
                    <TableCell className="text-text-secondary">{product.minStock}</TableCell>
                    <TableCell>
                      {product.stock <= 0 ? (
                        <Badge variant="danger">Sin stock</Badge>
                      ) : product.stock <= product.minStock ? (
                        <Badge variant="warning">
                          <AlertTriangle className="size-3" />
                          Stock bajo
                        </Badge>
                      ) : (
                        <Badge variant="success">Disponible</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="movimientos">
          {loadingMovements ? (
            <SkeletonTable rows={8} cols={5} />
          ) : movements.length === 0 ? (
            <EmptyState icon={Boxes} title="Sin movimientos registrados todavía." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Stock resultante</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-text-secondary">
                      {new Date(m.createdAt).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="font-medium">{m.product.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-[13px]">
                        {isEntrada(m.type) ? (
                          <ArrowUpCircle className="size-3.5 text-success" />
                        ) : (
                          <ArrowDownCircle className="size-3.5 text-danger" />
                        )}
                        {movementTypeLabels[m.type]}
                      </span>
                    </TableCell>
                    <TableCell>{m.quantity}</TableCell>
                    <TableCell className="text-text-secondary">
                      {m.stockBefore} → {m.stockAfter}
                    </TableCell>
                    <TableCell className="text-text-secondary">{m.user.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo ajuste de inventario"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
              Registrar
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Producto"
            options={actualProducts.map((p) => ({ value: p.id, label: `${p.name} (stock: ${p.stock})` }))}
            placeholder="Selecciona un producto"
            error={errors.productId?.message}
            {...register("productId")}
          />
          <Select
            label="Tipo de movimiento"
            options={manualMovementTypes.map((t) => ({ value: t, label: manualMovementTypeLabels[t] }))}
            error={errors.type?.message}
            {...register("type")}
          />
          <Input label="Cantidad" type="number" min="1" error={errors.quantity?.message} {...register("quantity")} />
          <Textarea label="Motivo (opcional)" error={errors.reason?.message} {...register("reason")} />
        </form>
      </Modal>
    </div>
  );
}
