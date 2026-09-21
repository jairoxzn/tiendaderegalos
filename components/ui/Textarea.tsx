import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-[13px] font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "w-full resize-none rounded-[var(--radius-control)] border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-secondary transition-colors outline-none",
            "focus:border-accent focus:ring-2 focus:ring-accent-soft",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-danger focus:border-danger focus:ring-danger-soft",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-[12px] text-danger">{error}</p>}
        {!error && hint && <p className="text-[12px] text-text-secondary">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
