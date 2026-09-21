import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-bg text-text-secondary">
          <Icon className="size-6" />
        </div>
      )}
      <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
      {description && <p className="max-w-sm text-[13px] text-text-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
