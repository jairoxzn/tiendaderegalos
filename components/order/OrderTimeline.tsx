"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  key: string;
  label: string;
}

export function OrderTimeline({
  steps,
  currentIndex,
  cancelled,
  onStepClick,
  disabled,
}: {
  steps: TimelineStep[];
  currentIndex: number;
  cancelled?: boolean;
  onStepClick?: (index: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start">
      {steps.map((step, index) => {
        const done = !cancelled && index <= currentIndex;
        const isCurrent = !cancelled && index === currentIndex;
        const clickable = !!onStepClick && !disabled;

        return (
          <div key={step.key} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-semibold transition-colors",
                  cancelled
                    ? "border-border bg-bg text-text-secondary"
                    : done
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-text-secondary",
                  clickable && "cursor-pointer",
                )}
                onClick={() => clickable && onStepClick(index)}
              >
                {done && !isCurrent ? <Check className="size-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={cn("h-0.5 flex-1", done && !cancelled ? "bg-accent" : "bg-border")} />
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-center text-[11.5px] font-medium",
                isCurrent ? "text-text-primary" : "text-text-secondary",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
