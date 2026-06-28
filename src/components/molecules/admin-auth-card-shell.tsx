import type { ReactNode } from "react";
import { Shield } from "lucide-react";
import { SamyogaLogoMark } from "@/components/atoms/samyoga-logo";
import { ThemeCycleControl } from "@/components/molecules/theme-cycle-control";

type AdminAuthCardShellProps = {
  children: ReactNode;
};

export function AdminAuthCardShell({ children }: AdminAuthCardShellProps) {
  return (
    <div className="relative w-full max-w-[420px]">
      <div
        className="pointer-events-none absolute -inset-px hidden rounded-[1.35rem] bg-linear-to-br from-secondary/14 via-transparent to-primary/8 opacity-90 blur-sm md:block"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/90 shadow-[0_18px_42px_-22px_var(--bezel-shadow)] ring-1 ring-(--bezel-highlight) backdrop-blur-md dark:border-border/55 dark:bg-card/75">
        <div className="absolute inset-y-0 left-0 w-1 bg-secondary/80" aria-hidden />
        <div className="p-7 pl-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <SamyogaLogoMark priority />
            <ThemeCycleControl />
          </div>
          <div className="mb-6 space-y-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              Platform administration
            </h1>
            <p className="text-sm leading-relaxed text-muted">
              Super-admin access only. Hospital staff use the HMS portal.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">
              <Shield className="h-3.5 w-3.5" aria-hidden />
              Operator sign-in
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
