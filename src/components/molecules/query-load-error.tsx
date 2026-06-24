"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/button";

type QueryLoadErrorProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function QueryLoadError({
  message,
  onRetry,
  retryLabel = "Try again",
}: QueryLoadErrorProps) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry ? (
        <Button type="button" variant="secondary" size="sm" className="mt-3 gap-1.5" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
