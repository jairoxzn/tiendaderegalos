"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Gift } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setFormError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setFormError("Correo o contraseña incorrectos.");
      return;
    }

    router.push(searchParams.get("callbackUrl") || "/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[14px] bg-accent text-white shadow-[var(--shadow-soft)]">
            <Gift className="size-6" />
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">GiftFlow</h1>
            <p className="mt-1 text-[13px] text-text-secondary">Inicia sesión para continuar</p>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@giftflow.pe"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Button type="submit" size="lg" loading={isSubmitting} className="mt-2 w-full">
              Ingresar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
