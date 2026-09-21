"use client";

import { Menu, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface HeaderProps {
  userName: string;
  userRole: "ADMIN" | "VENDEDOR";
  onOpenMobileNav: () => void;
}

export function Header({ userName, userRole, onOpenMobileNav }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <Button variant="icon" size="iconMd" className="lg:hidden" onClick={onOpenMobileNav} aria-label="Abrir menú">
        <Menu className="size-5" />
      </Button>

      <div className="hidden lg:block" />

      <Dropdown>
        <DropdownTrigger>
          <button className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-bg">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent">
              <UserIcon className="size-4" />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[13px] font-medium leading-tight text-text-primary">{userName}</p>
            </div>
            <ChevronDown className="size-3.5 text-text-secondary" />
          </button>
        </DropdownTrigger>
        <DropdownMenu>
          <div className="px-3 py-2">
            <p className="text-[13px] font-semibold text-text-primary">{userName}</p>
            <Badge variant={userRole === "ADMIN" ? "accent" : "neutral"} className="mt-1.5">
              {userRole === "ADMIN" ? "Administrador" : "Vendedor"}
            </Badge>
          </div>
          <DropdownSeparator />
          <DropdownItem danger onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="size-4" />
            Cerrar sesión
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </header>
  );
}
