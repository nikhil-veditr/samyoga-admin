"use client";

import { Button } from "@/components/atoms/button";

type PortalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PortalError({ error, reset }: PortalErrorProps) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-heading text-xl font-semibold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted">
        {error.message || "An unexpected error occurred. Try again or refresh the page."}
      </p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
