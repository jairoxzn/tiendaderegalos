"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Drawer } from "@/components/ui/Drawer";
import type { Role } from "@prisma/client";

export function AppShell({
  userName,
  userRole,
  children,
}: {
  userName: string;
  userRole: Role;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("giftflow:sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem("giftflow:sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-bg">
      <div className="no-print hidden lg:block">
        <Sidebar role={userRole} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </div>

      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        side="left"
        width="248px"
        contentClassName="p-0"
      >
        <Sidebar
          role={userRole}
          collapsed={false}
          onToggleCollapsed={() => {}}
          onNavigate={() => setMobileNavOpen(false)}
          onClose={() => setMobileNavOpen(false)}
        />
      </Drawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="no-print">
          <Header userName={userName} userRole={userRole} onOpenMobileNav={() => setMobileNavOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
