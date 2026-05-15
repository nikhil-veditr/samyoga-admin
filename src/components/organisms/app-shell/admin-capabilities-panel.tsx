"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import {
  ALL_SUPER_ADMIN_CAPABILITIES,
  SUPER_ADMIN_CAPABILITY_GROUPS,
  type AdminCapabilityRisk,
} from "@/shared/config/admin-capabilities";

const riskLabel: Record<AdminCapabilityRisk, string> = {
  read: "View",
  write: "Update",
  critical: "Critical",
};

const riskClass: Record<AdminCapabilityRisk, string> = {
  read: "bg-muted/30 text-muted",
  write: "bg-secondary/15 text-secondary",
  critical: "bg-danger/10 text-danger",
};

type AdminCapabilitiesPanelProps = {
  variant?: "sidebar" | "rail";
  onNavigate?: () => void;
};

export function AdminCapabilitiesPanel({ variant = "sidebar", onNavigate }: AdminCapabilitiesPanelProps) {
  const pathname = usePathname();
  const compact = variant === "sidebar";

  return (
    <section
      className={
        compact
          ? "border-t border-border px-3 py-3"
          : "rounded-lg border border-border bg-card/80 p-4 shadow-sm"
      }
      aria-label="Super admin capabilities"
    >
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Super admin</h2>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-muted">
        Platform operator actions. Writes and critical changes always require confirmation before they run.
      </p>

      <div className={compact ? "max-h-48 space-y-3 overflow-y-auto" : "space-y-4"}>
        {SUPER_ADMIN_CAPABILITY_GROUPS.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted/80">{group.title}</p>
            <ul className="space-y-1">
              {group.items.map((cap) => {
                const Icon = cap.icon;
                const active =
                  cap.href === "/"
                    ? pathname === "/" || pathname === ""
                    : cap.href === "/tenants"
                      ? pathname === "/tenants"
                      : pathname === cap.href || pathname.startsWith(`${cap.href}/`);
                return (
                  <li key={cap.id}>
                    <Link
                      href={cap.href}
                      onClick={() => onNavigate?.()}
                      className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-left transition ${
                        active ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-background"
                      }`}
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground">{cap.label}</span>
                          <span
                            className={`rounded px-1 py-0.5 text-[10px] font-medium uppercase ${riskClass[cap.risk]}`}
                          >
                            {riskLabel[cap.risk]}
                          </span>
                          {cap.requiresConfirmation ? (
                            <span className="text-[10px] text-muted">· confirm</span>
                          ) : null}
                        </span>
                        {!compact ? (
                          <span className="mt-0.5 block text-[11px] text-muted">{cap.description}</span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {!compact ? (
        <p className="mt-4 border-t border-border/60 pt-3 text-[11px] text-muted">
          {ALL_SUPER_ADMIN_CAPABILITIES.length} actions available · HMS tenant users use a separate app
        </p>
      ) : null}
    </section>
  );
}
