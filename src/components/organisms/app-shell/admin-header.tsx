"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { IconButton } from "@/components/atoms/icon-button";
import { titleForAdminPath } from "@/shared/config/admin-nav";
import { AdminUserMenu } from "@/components/organisms/app-shell/admin-user-menu";

type AdminHeaderProps = {
  onOpenMobileSidebar: () => void;
  mobileNavOpen?: boolean;
};

export function AdminHeader({ onOpenMobileSidebar, mobileNavOpen = false }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = titleForAdminPath(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-4 md:h-16 md:px-6">
      <IconButton
        label="Open navigation menu"
        aria-controls="admin-sidebar"
        aria-expanded={mobileNavOpen}
        className="h-9 w-9 md:hidden"
        onClick={() => onOpenMobileSidebar()}
      >
        <Menu className="h-5 w-5" aria-hidden />
      </IconButton>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-heading text-lg font-semibold text-foreground md:text-xl">{title}</h1>
        <p className="hidden truncate text-xs text-muted md:block">Platform operations</p>
      </div>

      <AdminUserMenu />
    </header>
  );
}
