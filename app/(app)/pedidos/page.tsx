"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Plus, Trash2, Sparkles } from "lucide-react";
import {
  createOrderSchema,
  type CreateOrderInput,
  type CreateOrderFormValues,
  orderStatusValues,
  orderPaymentMethods,
} from "@/schemas/order";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { FileUpload } from "@/components/ui/FileUpload";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusBadge } from "@/components/order/OrderStatus";
import { orderStatusLabels } from "@/lib/order-labels";
import { formatCurrency } from "@/lib/currency";

interface CustomerOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: string;
}

interface OrderRow {
  id: string;
  code: string;
  status: (typeof orderStatusValues)[number];
  isCustom: boolean;
  total: string;
  deposit: string;
  balance: string;
  createdAt: string;
  customer: { name: string; phone: string | null };
  delivery: { status: string } | null;
}

export default function PedidosPage() {
  const [data, setData] = useState({ items: [] as OrderRow[], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  const toast = useToast();

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/pedidos?${params}`)
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter, page]);

  useEffect(() => {
    fetch("/api/clientes?pageSize=200")
      .then((res) => res.json())
      .then((d) => setCustomers(d.items ?? []));
    fetch("/api/productos?pageSize=200&status=ACTIVO")
      .then((res) => res.json())
      .then((d) => setProducts(d.items ?? []));
  }, []);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderFormValues, unknown, CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: null, name: "", quantity: 1, price: 0 }],
      deposit: 0,
      isCustom: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const isCustom = watch("isCustom");
  const items = watch("items");
  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  const openCreate = () => {
    reset({
      customerId: "",
      items: [{ productId: null, name: "", quantity: 1, price: 0 }],
      message: "",
      deliveryDate: "",
      deliveryTime: "",
      address: "",
      reference: "",
      deposit: 0,
      paymentMethod: null,
      isCustom: false,
      customText: "",
      customColor: "",
      customReference: "",
      customImageUrl: null,
      customDesignUrl: null,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: CreateOrderInput) => {
    const { error } = await apiRequest("/api/pedidos", { method: "POST", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo crear el pedido", description: error });
      return;
    }
    toast({ variant: "success", title: "Pedido creado" });
    setModalOpen(false);
    load();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Pedidos</h1>
          <p className="text-[13px] text-text-secondary">{data.total} pedidos registrados.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nuevo pedido
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${statusFilter === "" ? "bg-accent text-white" : "bg-bg text-text-secondary hover:text-text-primary"}`}
        >
          Todos
        </button>
        {orderStatusValues.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${statusFilter === s ? "bg-accent text-white" : "bg-bg text-text-secondary hover:text-text-primary"}`}
          >
            {orderStatusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTable rows={8} cols={6} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tienes pedidos todavía."
          description="Crea tu primer pedido para comenzar a organizarlos."
          action={<Button onClick={openCreate}><Plus className="size-4" />Nuevo pedido</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  <Link href={`/pedidos/${order.id}`} className="hover:text-accent">
                    {order.code}
                  </Link>
                </TableCell>
                <TableCell className="text-text-secondary">{order.customer.name}</TableCell>
                <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                <TableCell className={Number(order.balance) > 0 ? "text-warning" : "text-success"}>
                  {formatCurrency(Number(order.balance))}
                </TableCell>
                <TableCell>
                  {order.isCustom ? (
                    <Badge variant="accent">
                      <Sparkles className="size-3" /> Personalizado
                    </Badge>
                  ) : (
                    <Badge variant="neutral">Estándar</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="mt-4">
        <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} totalItems={data.total} pageSize={20} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo pedido"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={isSubmitting}>Crear pedido</Button>
          </>
        }
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Cliente"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecciona un cliente"
            error={errors.customerId?.message}
            {...register("customerId")}
          />

          <div>
            <p className="mb-2 text-[13px] font-medium text-text-primary">Productos</p>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2">
                  <Select
                    options={[
                      { value: "", label: "Personalizado / otro" },
                      ...products.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                    value={items[index]?.productId ?? ""}
                    onChange={(e) => {
                      const product = products.find((p) => p.id === e.target.value);
                      setValue(`items.${index}.productId`, e.target.value || null);
                      if (product) {
                        setValue(`items.${index}.name`, product.name);
                        setValue(`items.${index}.price`, Number(product.price));
                      }
                    }}
                    className="flex-[2]"
                  />
                  <Input placeholder="Nombre" className="flex-[2]" {...register(`items.${index}.name`)} />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    className="w-20"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Precio"
                    className="w-28"
                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                  />
                  <Button
                    variant="icon"
                    size="iconMd"
                    className="hover:text-danger"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    aria-label="Quitar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={() => append({ productId: null, name: "", quantity: 1, price: 0 })}
            >
              <Plus className="size-4" />
              Agregar producto
            </Button>
            {errors.items?.message && <p className="mt-1 text-[12px] text-danger">{errors.items.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Fecha de entrega" type="date" {...register("deliveryDate")} />
            <Input label="Hora de entrega" type="time" {...register("deliveryTime")} />
            <Input label="Dirección" {...register("address")} />
            <Input label="Referencia" {...register("reference")} />
            <Input label="Adelanto (S/)" type="number" step="0.01" min="0" {...register("deposit", { valueAsNumber: true })} />
            <Select
              label="Método de pago"
              options={orderPaymentMethods.map((m) => ({ value: m, label: m }))}
              placeholder="Selecciona un método"
              {...register("paymentMethod")}
            />
          </div>

          <Textarea label="Mensaje para el pedido (opcional)" {...register("message")} />

          <div className="flex items-center justify-between rounded-[12px] bg-bg px-4 py-3">
            <span className="text-[13px] font-medium text-text-primary">Total del pedido</span>
            <span className="text-[15px] font-semibold text-text-primary">{formatCurrency(total)}</span>
          </div>

          <label className="flex items-center gap-2.5 text-[13px] font-medium text-text-primary">
            <input type="checkbox" className="size-4 rounded border-border accent-[color:var(--color-accent)]" {...register("isCustom")} />
            Este es un pedido personalizado
          </label>

          {isCustom && (
            <div className="grid grid-cols-1 gap-4 rounded-[14px] border border-accent-soft bg-accent-soft/30 p-4 sm:grid-cols-2">
              <Textarea label="Texto / dedicatoria" className="sm:col-span-2" {...register("customText")} />
              <Input label="Color" {...register("customColor")} />
              <Input label="Referencia de diseño" {...register("customReference")} />
              <Controller
                control={control}
                name="customImageUrl"
                render={({ field }) => (
                  <FileUpload label="Imagen de referencia" value={field.value} onChange={field.onChange} />
                )}
              />
              <Controller
                control={control}
                name="customDesignUrl"
                render={({ field }) => (
                  <FileUpload label="Diseño aprobado" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
