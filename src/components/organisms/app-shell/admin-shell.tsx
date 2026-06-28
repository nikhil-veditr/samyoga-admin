"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import { AdminStrongAuthBanner } from "@/components/molecules/admin-strong-auth-banner";
import { AdminCapabilitiesPanel } from "@/components/organisms/app-shell/admin-capabilities-panel";
import { AdminHeader } from "@/components/organisms/app-shell/admin-header";
import { AdminSidebar } from "@/components/organisms/app-shell/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileNavOpen]);

  return (
    <div className="admin-shell relative flex bg-background">
      <AnimatePresence>
        {mobileNavOpen ? (
          <m.button
            key="nav-overlay"
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
            aria-label="Close navigation overlay"
            onClick={() => setMobileNavOpen(false)}
            initial={reducedMotion ? undefined : { opacity: 0 }}
            animate={reducedMotion ? undefined : { opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        ) : null}
      </AnimatePresence>

      <AdminSidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader mobileNavOpen={mobileNavOpen} onOpenMobileSidebar={() => setMobileNavOpen(true)} />
        <AdminStrongAuthBanner />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait" initial={false}>
              <m.main
                key={pathname}
                className="admin-shell__main min-h-0 min-w-0 flex-1 p-4 md:p-6"
                initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
                animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </m.main>
            </AnimatePresence>
          </LazyMotion>
          <aside className="app-scroll-y hidden w-72 shrink-0 border-l border-border/70 bg-card/30 p-4 backdrop-blur-sm xl:block">
            <AdminCapabilitiesPanel variant="rail" />
          </aside>
        </div>
      </div>
    </div>
  );
}
