import type { LucideIcon } from "lucide-react";
import { Building2, LayoutDashboard, MessageSquare, PlusCircle, Puzzle } from "lucide-react";

export type AdminCapabilityRisk = "read" | "write" | "critical";

export type AdminCapability = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  risk: AdminCapabilityRisk;
  /** Shown in UI — every write/critical action uses a confirmation step in the app. */
  requiresConfirmation: boolean;
};

export const SUPER_ADMIN_CAPABILITY_GROUPS: { title: string; items: AdminCapability[] }[] = [
  {
    title: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        description: "Platform snapshot and quick links",
        href: "/",
        icon: LayoutDashboard,
        risk: "read",
        requiresConfirmation: false,
      },
    ],
  },
  {
    title: "Platform modules",
    items: [
      {
        id: "features-manage",
        label: "Feature catalog",
        description: "Enable or disable HMS modules for the whole platform",
        href: "/features",
        icon: Puzzle,
        risk: "critical",
        requiresConfirmation: true,
      },
    ],
  },
  {
    title: "Hospital workspaces",
    items: [
      {
        id: "tenants-list",
        label: "Tenants",
        description: "View workspaces, deactivate or reactivate hospitals",
        href: "/tenants",
        icon: Building2,
        risk: "write",
        requiresConfirmation: true,
      },
      {
        id: "tenants-provision",
        label: "Provision tenant",
        description: "Create hospital, modules, ADMIN role, and first user",
        href: "/tenants/new",
        icon: PlusCircle,
        risk: "critical",
        requiresConfirmation: true,
      },
      {
        id: "feedback-triage",
        label: "User feedback",
        description: "Review HMS user reports and update triage status",
        href: "/feedback",
        icon: MessageSquare,
        risk: "write",
        requiresConfirmation: false,
      },
    ],
  },
];

export const ALL_SUPER_ADMIN_CAPABILITIES = SUPER_ADMIN_CAPABILITY_GROUPS.flatMap((g) => g.items);

export function capabilitiesForPath(pathname: string): AdminCapability[] {
  return ALL_SUPER_ADMIN_CAPABILITIES.filter((cap) => {
    if (cap.href === "/") return pathname === "/" || pathname === "";
    if (cap.href === "/tenants") return pathname === "/tenants";
    if (cap.href === "/feedback") return pathname === "/feedback";
    return pathname === cap.href || pathname.startsWith(`${cap.href}/`);
  });
}
