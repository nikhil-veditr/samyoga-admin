"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/button";

type ListPageRefreshButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export type ListPageRefreshButtonProps = {
  onClick: () => void;
  busy?: boolean;
  spinning?: boolean;
  label?: string;
  "aria-label"?: string;
  variant?: ListPageRefreshButtonVariant;
  className?: string;
};

export function ListPageRefreshButton({
  onClick,
  busy = false,
  spinning,
  label = "Refresh",
  "aria-label": ariaLabel,
  variant = "ghost",
  className = "gap-2",
}: ListPageRefreshButtonProps) {
  const spin = spinning ?? busy;

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={onClick}
      disabled={busy}
      aria-label={ariaLabel ?? "Refresh list"}
      aria-busy={busy}
    >
      <RefreshCw className={`h-4 w-4 shrink-0 ${spin ? "animate-spin" : ""}`} aria-hidden />
      {label}
    </Button>
  );
}
