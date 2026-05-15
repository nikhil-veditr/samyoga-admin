"use client";

import { useEffect, useState } from "react";
import { AdminCapabilitiesPanel } from "@/components/organisms/app-shell/admin-capabilities-panel";
import { AdminHeader } from "@/components/organisms/app-shell/admin-header";
import { AdminSidebar } from "@/components/organisms/app-shell/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
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
    <div className="relative flex min-h-screen bg-background">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close navigation overlay"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <AdminSidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader mobileNavOpen={mobileNavOpen} onOpenMobileSidebar={() => setMobileNavOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <main className="app-scroll min-h-0 min-w-0 flex-1 p-4 md:p-6">{children}</main>
          <aside className="app-scroll-y hidden w-72 shrink-0 border-l border-border bg-card/40 p-4 xl:block">
            <AdminCapabilitiesPanel variant="rail" />
          </aside>
        </div>
      </div>
    </div>
  );
}
