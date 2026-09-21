"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessSettingsSchema, type BusinessSettingsInput } from "@/schemas/settings";
import { apiRequest } from "@/hooks/useCrudList";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FileUpload } from "@/components/ui/FileUpload";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusinessSettingsInput>({ resolver: zodResolver(businessSettingsSchema) });

  useEffect(() => {
    fetch("/api/configuracion")
      .then((res) => res.json())
      .then((data) => {
        reset({
          storeName: data.storeName ?? "",
          ruc: data.ruc ?? "",
          address: data.address ?? "",
          phone: data.phone ?? "",
          whatsapp: data.whatsapp ?? "",
          email: data.email ?? "",
          logoUrl: data.logoUrl ?? null,
          receiptFooterText: data.receiptFooterText ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (values: BusinessSettingsInput) => {
    const { error } = await apiRequest("/api/configuracion", { method: "PATCH", body: JSON.stringify(values) });
    if (error) {
      toast({ variant: "danger", title: "No se pudo guardar la configuración", description: error });
      return;
    }
    toast({ variant: "success", title: "Configuración guardada" });
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <Skeleton className="h-96 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold tracking-tight text-text-primary">Configuración</h1>
        <p className="text-[13px] text-text-secondary">Datos generales de tu tienda.</p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              control={control}
              name="logoUrl"
              render={({ field }) => (
                <FileUpload label="Logo de la tienda" value={field.value} onChange={field.onChange} aspect="square" />
              )}
            />
            <Input label="Nombre de la tienda" error={errors.storeName?.message} {...register("storeName")} />
            <Input label="RUC" error={errors.ruc?.message} {...register("ruc")} />
            <Input label="Dirección" error={errors.address?.message} {...register("address")} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Teléfono" error={errors.phone?.message} {...register("phone")} />
              <Input label="WhatsApp" error={errors.whatsapp?.message} {...register("whatsapp")} />
            </div>
            <Input label="Correo" type="email" error={errors.email?.message} {...register("email")} />
            <Textarea label="Texto de pie de recibo (opcional)" error={errors.receiptFooterText?.message} {...register("receiptFooterText")} />
            <Button type="submit" loading={isSubmitting} className="self-start">
              Guardar cambios
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
