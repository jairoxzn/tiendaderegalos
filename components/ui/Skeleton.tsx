import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-black/[0.06]", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6">
      <Skeleton className="mb-4 h-4 w-1/3" />
      <Skeleton className="mb-2 h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4">
            {Array.from({ length: cols }).map((__, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-border bg-surface p-3">
          <Skeleton className="mb-3 aspect-square w-full rounded-[12px]" />
          <Skeleton className="mb-2 h-3.5 w-4/5" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
      ))}
    </div>
  );
}
