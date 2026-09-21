import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, type = "text", ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "h-10 w-full rounded-[var(--radius-control)] border border-border bg-surface px-3.5 text-sm text-text-primary placeholder:text-text-secondary transition-colors outline-none",
              "focus:border-accent focus:ring-2 focus:ring-accent-soft",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-9",
              error && "border-danger focus:border-danger focus:ring-danger-soft",
              className,
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error && <p className="text-[12px] text-danger">{error}</p>}
        {!error && hint && <p className="text-[12px] text-text-secondary">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export function SearchInput(props: Omit<InputProps, "icon" | "type">) {
  return <Input type="search" icon={<Search className="size-4" />} {...props} />;
}
