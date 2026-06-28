"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/atoms/button";

type PortalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PortalError({ error, reset }: PortalErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-8 shadow-sm">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="font-heading text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          {error.message || "An unexpected error occurred. Try again or refresh the page."}
        </p>
        <Button type="button" className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
