"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { resolveTheme } from "@/shared/lib/theme/resolved-theme";
import { useSystemDark } from "@/shared/hooks/use-system-dark";
import { useUiStore } from "@/shared/store/ui-store";

type ThemeCycleControlProps = {
  className?: string;
  /** Compact icon button (sign-in, etc.) or full-width sidebar row with labels. */
  variant?: "icon" | "sidebar";
};

export function ThemeCycleControl({ className = "", variant = "icon" }: ThemeCycleControlProps) {
  const preference = useUiStore((state) => state.themePreference);
  const cycleThemePreference = useUiStore((state) => state.cycleThemePreference);
  const systemDark = useSystemDark();
  const resolved = resolveTheme(preference, systemDark);

  const ariaLabel =
    preference === "system"
      ? `Theme follows your device (${resolved === "dark" ? "dark" : "light"}). Click to switch to light.`
      : preference === "light"
        ? "Light theme. Click for dark."
        : "Dark theme. Click to follow device settings.";

  const Icon = preference === "system" ? Monitor : preference === "light" ? Sun : Moon;

  if (variant === "sidebar") {
    const title =
      preference === "system" ? "Match device" : preference === "light" ? "Light appearance" : "Dark appearance";
    const subtitle =
      preference === "system"
        ? `Uses OS setting · now ${resolved}`
        : preference === "light"
          ? "Always light · click to change"
          : "Always dark · click to change";

    return (
      <button
        type="button"
        onClick={cycleThemePreference}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={`flex w-full items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-left hover:bg-background ${className}`.trim()}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight text-foreground">{title}</span>
          <span className="mt-0.5 block text-[11px] leading-snug text-muted">{subtitle}</span>
        </span>
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={className}
      onClick={cycleThemePreference}
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <Icon size={17} strokeWidth={1.75} />
    </Button>
  );
}
