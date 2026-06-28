"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/shared/config/admin-nav";
import { AdminCapabilitiesPanel } from "@/components/organisms/app-shell/admin-capabilities-panel";
import { SamyogaLogoMark } from "@/components/atoms/samyoga-logo";
import { ThemeCycleControl } from "@/components/molecules/theme-cycle-control";
import { useNavPrefetch } from "@/shared/hooks/use-nav-prefetch";
import { LayoutGroup, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

type AdminSidebarProps = {
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

function linkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname === "";
  if (href === "/features") return pathname === "/features";
  if (href === "/tenants") return pathname === "/tenants";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const prefetchNav = useNavPrefetch();

  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%-3rem,17.5rem)] flex-col border-r border-border/70 bg-sidebar/95 backdrop-blur-xl transition-transform duration-200 md:static md:z-0 md:w-60 md:translate-x-0 lg:w-64 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex h-14 items-center justify-between gap-2 border-b border-border/70 px-4 md:h-16">
        <Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={() => onCloseMobile()}>
          <SamyogaLogoMark />
          <div className="min-w-0 leading-tight">
            <span className="block truncate font-heading text-sm font-semibold text-foreground">Samyoga</span>
            <span className="mt-0.5 inline-flex rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-medium text-secondary">
              Platform Admin
            </span>
          </div>
        </Link>
        <button
          type="button"
          aria-label="Close navigation"
          className="rounded-lg p-1 text-muted hover:bg-card md:hidden"
          onClick={() => onCloseMobile()}
        >
          <PanelLeftClose className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <LazyMotion features={domAnimation}>
        <LayoutGroup id="admin-sidebar-nav">
          <nav className="app-scroll-y flex flex-1 flex-col gap-1 p-3" aria-label="Admin navigation">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = linkActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onCloseMobile()}
                  onMouseEnter={() => prefetchNav(item.href)}
                  onFocus={() => prefetchNav(item.href)}
                  className={`relative flex items-start gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "text-primary"
                      : "text-foreground/80 hover:bg-card hover:text-foreground"
                  }`}
                >
                  {active ? (
                    <m.span
                      layoutId="admin-sidebar-active-bg"
                      aria-hidden
                      className="absolute inset-0 -z-10 rounded-lg bg-primary/15 ring-1 ring-primary/25"
                      transition={reducedMotion ? undefined : { duration: 0.2 }}
                    />
                  ) : null}
                  <m.span
                    className="relative mt-0.5 shrink-0"
                    whileHover={reducedMotion ? undefined : { scale: 1.08 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Icon className="h-4 w-4 text-inherit" aria-hidden />
                  </m.span>
                  <span className="min-w-0">
                    <span className="block font-medium">{item.label}</span>
                    {item.description ? (
                      <span className="mt-0.5 block text-xs text-muted">{item.description}</span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>
      </LazyMotion>

      <div className="xl:hidden">
        <AdminCapabilitiesPanel variant="sidebar" onNavigate={onCloseMobile} />
      </div>

      <div className="border-t border-border/70 p-3">
        <ThemeCycleControl variant="sidebar" />
      </div>
    </aside>
  );
}
