import {
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Package,
  Boxes,
  Users,
  Truck,
  ShoppingBag,
  Wallet,
  Receipt,
  BarChart3,
  BookImage,
  Settings,
  UserCog,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@prisma/client";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "POS", href: "/pos", icon: ShoppingCart },
  { label: "Pedidos", href: "/pedidos", icon: ClipboardList },
  { label: "Productos", href: "/productos", icon: Package },
  { label: "Inventario", href: "/inventario", icon: Boxes },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Delivery", href: "/delivery", icon: Truck },
  { label: "Promociones", href: "/promociones", icon: Tag, roles: ["ADMIN"] },
  { label: "Proveedores", href: "/proveedores", icon: ShoppingBag, roles: ["ADMIN"] },
  { label: "Compras", href: "/compras", icon: ShoppingBag, roles: ["ADMIN"] },
  { label: "Caja", href: "/caja", icon: Wallet },
  { label: "Gastos", href: "/gastos", icon: Receipt, roles: ["ADMIN"] },
  { label: "Reportes", href: "/reportes", icon: BarChart3, roles: ["ADMIN"] },
  { label: "Catálogo", href: "/catalogo", icon: BookImage },
  { label: "Usuarios", href: "/usuarios", icon: UserCog, roles: ["ADMIN"] },
  { label: "Configuración", href: "/configuracion", icon: Settings, roles: ["ADMIN"] },
];
