"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

export type InlineFeedbackVariant = "info" | "warning" | "error";

const shell: Record<InlineFeedbackVariant, string> = {
  info: "border-border/70 bg-card/80 text-foreground ring-1 ring-border/45 dark:bg-card/50",
  warning:
    "border-secondary/45 bg-secondary/12 text-foreground ring-1 ring-secondary/25 dark:bg-secondary/15",
  error: "border-danger/50 bg-danger/10 text-foreground ring-1 ring-danger/30 dark:bg-danger/15",
};

const iconWrap: Record<InlineFeedbackVariant, string> = {
  info: "text-primary",
  warning: "text-secondary",
  error: "text-danger",
};

const icons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

export type InlineFeedbackProps = {
  variant: InlineFeedbackVariant;
  children: ReactNode;
  /** Extra classes on the outer container */
  className?: string;
  /** Visually hidden context for screen readers when children are not enough */
  title?: string;
  /** When false, no leading icon (for compact persistent messages). */
  showIcon?: boolean;
  /** Override default role: error → alert; otherwise status. */
  role?: "alert" | "status";
};

/**
 * Persistent inline notice (info / warning / error). Prefer this over toasts
 * for form-level validation and contextual reminders that should stay visible.
 */
export function InlineFeedback({
  variant,
  children,
  className = "",
  title,
  showIcon = true,
  role: roleProp,
}: InlineFeedbackProps) {
  const Icon = icons[variant];
  const role = roleProp ?? (variant === "error" ? "alert" : "status");

  return (
    <div
      role={role}
      className={`flex rounded-lg border px-3 py-2.5 text-sm leading-snug ${showIcon ? "gap-2.5" : ""} ${shell[variant]} ${className}`}
    >
      {showIcon ? (
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconWrap[variant]}`} aria-hidden />
      ) : null}
      <div className="min-w-0 flex-1">
        {title ? <span className="sr-only">{title}</span> : null}
        {children}
      </div>
    </div>
  );
}
