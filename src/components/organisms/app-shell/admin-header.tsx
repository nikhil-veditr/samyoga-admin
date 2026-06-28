"use client";

import { Menu, Shield } from "lucide-react";
import { usePathname } from "next/navigation";
import { IconButton } from "@/components/atoms/icon-button";
import { titleForAdminPath } from "@/shared/config/admin-nav";
import { AdminUserMenu } from "@/components/organisms/app-shell/admin-user-menu";
import { useAdminChromeLoading } from "@/shared/hooks/use-admin-chrome-loading";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";

type AdminHeaderProps = {
  onOpenMobileSidebar: () => void;
  mobileNavOpen?: boolean;
};

export function AdminHeader({ onOpenMobileSidebar, mobileNavOpen = false }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = titleForAdminPath(pathname);
  const reducedMotion = useReducedMotion();
  const chromeLoading = useAdminChromeLoading();

  if (chromeLoading) {
    return (
      <header className="z-30 grid h-14 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 overflow-visible border-b border-border/60 bg-card/95 px-3 backdrop-blur-md md:h-17 md:px-6">
        <IconButton
          label="Open navigation menu"
          aria-controls="admin-sidebar"
          aria-expanded={mobileNavOpen}
          className="h-9 w-9 md:hidden"
          onClick={() => onOpenMobileSidebar()}
          disabled
        >
          <Menu className="h-5 w-5 opacity-40" aria-hidden />
        </IconButton>
        <div className="min-w-0">
          <div className="h-6 w-40 max-w-full animate-pulse rounded bg-muted/50" aria-hidden />
        </div>
        <div className="h-9 w-9 animate-pulse rounded-lg bg-muted/40" aria-hidden />
      </header>
    );
  }

  return (
    <header className="z-30 grid h-14 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 overflow-visible border-b border-border/60 bg-card/95 px-3 backdrop-blur-md md:h-17 md:px-6">
      <IconButton
        label="Open navigation menu"
        aria-controls="admin-sidebar"
        aria-expanded={mobileNavOpen}
        className="h-9 w-9 md:hidden"
        onClick={() => onOpenMobileSidebar()}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </IconButton>

      <div className="min-w-0">
        <LazyMotion features={domAnimation}>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="truncate font-heading text-lg font-semibold tracking-tight text-foreground md:text-xl">
              {reducedMotion ? (
                title
              ) : (
                <m.span
                  key={title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {title}
                </m.span>
              )}
            </h1>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary">
              <Shield className="h-3 w-3" aria-hidden />
              Platform Admin
            </span>
          </div>
        </LazyMotion>
        <p className="hidden truncate text-xs text-muted md:block">Internal platform operations</p>
      </div>

      <div className="justify-self-end shrink-0 overflow-visible">
        <AdminUserMenu />
      </div>
    </header>
  );
}
