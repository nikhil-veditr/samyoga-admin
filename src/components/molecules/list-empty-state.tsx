import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/atoms/button";

export type ListEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: ReactNode;
};

export function ListEmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}: ListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      {Icon ? (
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      ) : null}
      <p className="font-heading text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {primaryAction || secondaryAction ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction ? (
            <Button type="button" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
