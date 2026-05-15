import type { LucideIcon } from "lucide-react";
import { Building2, LayoutDashboard, PlusCircle, Puzzle } from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions",
  },
  {
    href: "/features",
    label: "Features",
    icon: Puzzle,
    description: "Enable or disable platform modules",
  },
  {
    href: "/tenants",
    label: "Tenants",
    icon: Building2,
    description: "Hospitals and workspaces",
  },
  {
    href: "/tenants/new",
    label: "Provision tenant",
    icon: PlusCircle,
    description: "Create hospital + admin user",
  },
];

export function titleForAdminPath(pathname: string): string {
  if (pathname === "/" || pathname === "") return "Dashboard";
  if (pathname === "/features") return "Features";
  if (pathname === "/tenants") return "Tenants";
  if (pathname.startsWith("/tenants/new")) return "Provision tenant";
  return "Samyoga Admin";
}
