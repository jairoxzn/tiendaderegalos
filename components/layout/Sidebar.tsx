"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import { Tooltip } from "@/components/ui/Tooltip";

export interface SidebarProps {
  role: Role;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
}

export function Sidebar({ role, collapsed, onToggleCollapsed, onNavigate, onClose }: SidebarProps) {
  const pathname = usePathname();
  const items = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out",
        collapsed ? "w-[76px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2.5 px-5", collapsed && "justify-center px-0")}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-accent text-white">
          <Gift className="size-[18px]" />
        </div>
        {!collapsed && <span className="text-[15px] font-semibold tracking-tight text-text-primary">GiftFlow</span>}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="ml-auto flex size-8 items-center justify-center rounded-full text-text-secondary hover:bg-bg hover:text-text-primary"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-text-secondary hover:bg-bg hover:text-text-primary",
              )}
            >
              <item.icon className={cn("size-[18px] shrink-0", active ? "text-accent" : "text-text-secondary group-hover:text-text-primary")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          return collapsed ? (
            <Tooltip key={item.href} content={item.label} side="top">
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      {!onClose && (
        <div className="border-t border-border p-3">
          <button
            onClick={onToggleCollapsed}
            className={cn(
              "flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-[13px] font-medium text-text-secondary hover:bg-bg hover:text-text-primary",
              collapsed && "justify-center px-0",
            )}
          >
            {collapsed ? <ChevronsRight className="size-[18px]" /> : <ChevronsLeft className="size-[18px]" />}
            {!collapsed && <span>Contraer</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
