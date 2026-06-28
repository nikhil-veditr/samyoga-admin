"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { Avatar } from "@/components/atoms/avatar";
import {
  DropdownChevron,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItemDanger,
  DropdownMenuLink,
  DropdownMenuTrigger,
  useDropdownMenuContext,
} from "@/components/atoms/dropdown-menu";
import { ConfirmDialog } from "@/components/molecules/confirm-dialog";
import {
  adminAccountSwitcherChevronClass,
  adminAccountSwitcherLabelClass,
  adminAccountSwitcherMobileCompact,
  adminAccountSwitcherNameClass,
  adminAccountSwitcherTrigger,
} from "@/components/organisms/app-shell/admin-header-switcher";
import { signOutApp } from "@/services/auth/auth.hooks";
import { useAuthStore } from "@/shared/store/auth-store";
import { getUserInitials } from "@/shared/lib/user-display";

function SignOutItem({ onRequestSignOut }: { onRequestSignOut: () => void }) {
  const { setOpen } = useDropdownMenuContext();

  return (
    <DropdownMenuItemDanger
      className="w-full rounded-none"
      onClick={() => {
        setOpen(false);
        onRequestSignOut();
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden />
      Sign out
    </DropdownMenuItemDanger>
  );
}

function ProfileLinkItem() {
  const { setOpen } = useDropdownMenuContext();

  return (
    <DropdownMenuLink href="/profile" className="w-full rounded-none" onClick={() => setOpen(false)}>
      <UserRound className="h-4 w-4 text-muted" aria-hidden />
      Profile
    </DropdownMenuLink>
  );
}

export function AdminUserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Operator";
  const initials = getUserInitials(user?.firstName, user?.lastName, user?.email);

  const handleSignOut = async (): Promise<void> => {
    setSigningOut(true);
    try {
      await signOutApp();
      setConfirmOpen(false);
      router.push("/signin");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Your account — ${name}`}
          aria-haspopup="menu"
          className={`${adminAccountSwitcherTrigger} ${adminAccountSwitcherMobileCompact} relative`}
        >
          <Avatar initials={initials} size="sm" />
          <span className="hidden min-w-0 max-w-[140px] flex-col justify-center leading-tight md:flex md:max-w-[180px]">
            <span className={adminAccountSwitcherLabelClass}>Your account</span>
            <span className={adminAccountSwitcherNameClass}>{name}</span>
          </span>
          <DropdownChevron className={`hidden ${adminAccountSwitcherChevronClass} md:block`} />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          portaled={true}
          align="end"
          className="w-[min(calc(100vw-2rem),260px)] overflow-hidden py-0"
        >
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Your account</p>
            <div className="mt-2 flex min-w-0 items-center gap-3">
              <Avatar initials={initials} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{name}</p>
                {user?.email ? <p className="truncate text-xs text-muted">{user.email}</p> : null}
                <p className="mt-0.5 truncate text-xs text-secondary">Super admin</p>
              </div>
            </div>
          </div>
          <DropdownMenuGroup label="Account" bordered>
            <ProfileLinkItem />
            <SignOutItem onRequestSignOut={() => setConfirmOpen(true)} />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!signingOut) setConfirmOpen(open);
        }}
        title="Sign out?"
        description="You will need to sign in again to access the internal portal."
        confirmLabel="Sign out"
        destructive
        pending={signingOut}
        onConfirm={handleSignOut}
      />
    </>
  );
}
