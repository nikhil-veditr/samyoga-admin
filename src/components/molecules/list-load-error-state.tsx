"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/atoms/button";

export type ListLoadErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
};

export function ListLoadErrorState({
  message,
  onRetry,
  retryLabel = "Try again",
  compact = false,
}: ListLoadErrorStateProps) {
  return (
    <div className={compact ? "px-4 py-10 text-center" : "px-6 py-12 text-center"}>
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

export type ListTableErrorRowProps = {
  colSpan: number;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ListTableErrorRow({ colSpan, message, onRetry, retryLabel }: ListTableErrorRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <ListLoadErrorState message={message} onRetry={onRetry} retryLabel={retryLabel} compact />
      </td>
    </tr>
  );
}
