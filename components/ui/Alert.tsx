import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex items-start gap-3 rounded-[14px] border p-4 text-[13px]", {
  variants: {
    variant: {
      info: "border-info/20 bg-info-soft text-[#0a63c2]",
      success: "border-success/20 bg-success-soft text-[#1c8a3d]",
      warning: "border-warning/20 bg-warning-soft text-[#b5720a]",
      danger: "border-danger/20 bg-danger-soft text-[#d1362b]",
    },
  },
  defaultVariants: { variant: "info" },
});

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Alert({ variant = "info", title, children, className }: AlertProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div className={cn(alertVariants({ variant }), className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div className="text-text-primary/90">{children}</div>
      </div>
    </div>
  );
}
