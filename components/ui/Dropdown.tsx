"use client";

import { useEffect, useRef, useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export function Dropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown.Trigger/Menu must be used inside <Dropdown>");
  return ctx;
}

export function DropdownTrigger({ children }: { children: React.ReactElement }) {
  const { open, setOpen } = useDropdown();
  return (
    <span onClick={() => setOpen(!open)} className="inline-flex cursor-pointer">
      {children}
    </span>
  );
}

export function DropdownMenu({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const { open } = useDropdown();
  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute z-40 mt-2 min-w-[180px] animate-scale-in rounded-[14px] border border-border bg-surface p-1.5 shadow-[var(--shadow-elevated)]",
        align === "end" ? "right-0" : "left-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  className,
  danger,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  const { setOpen } = useDropdown();
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-bg",
        danger ? "text-danger" : "text-text-primary",
        className,
      )}
      onClick={(e) => {
        props.onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
}

export function DropdownSeparator() {
  return <div className="my-1.5 h-px bg-border" />;
}
