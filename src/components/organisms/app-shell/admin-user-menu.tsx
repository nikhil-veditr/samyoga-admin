"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Avatar } from "@/components/atoms/avatar";
import {
  DropdownChevron,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemDanger,
  DropdownMenuTrigger,
  useDropdownMenuContext,
} from "@/components/atoms/dropdown-menu";
import { signOutApp } from "@/services/auth/auth.hooks";
import { useAuthStore } from "@/shared/store/auth-store";
import { getUserInitials } from "@/shared/lib/user-display";

function SignOutItem() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const { setOpen } = useDropdownMenuContext();

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    try {
      await signOutApp();
      router.push("/signin");
      router.refresh();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  };

  return (
    <DropdownMenuItemDanger onClick={() => void handleSignOut()} disabled={signingOut}>
      {signingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
      Sign out
    </DropdownMenuItemDanger>
  );
}

export function AdminUserMenu() {
  const user = useAuthStore((s) => s.user);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Operator";
  const initials = getUserInitials(user?.firstName, user?.lastName, user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg border border-border bg-card py-1.5 pl-2 pr-2 hover:bg-background md:px-3"
      >
        <Avatar initials={initials} size="md" />
        <span className="hidden max-w-[160px] truncate text-sm font-medium text-foreground sm:inline">{name}</span>
        <DropdownChevron className="hidden h-4 w-4 text-muted sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="border-b border-border px-3 py-2 sm:hidden">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted">Super admin</p>
        </div>
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
