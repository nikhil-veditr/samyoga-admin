"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/atoms/button";

export type TablePaginationProps = {
  total: number;
  /** Current page (1-based), typically aligned with API `pagination.page`. */
  page: number;
  totalPages: number;
  /** Used for the “Showing …” range (rows per page lives in `TablePageSizeSelect`). */
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  /** Pages shown adjacent to the current page (common default: 1). */
  siblingCount?: number;
  /** Pages always shown at the start and end (common default: 1). */
  boundaryCount?: number;
  className?: string;
};

function fmtCount(n: number): string {
  return n.toLocaleString();
}

/**
 * MUI-style page list: boundaries + siblings around current, merged with ellipses for gaps.
 * @see https://mui.com/material-ui/react-pagination/ (usePagination semantics)
 */
function getPaginationRange(
  current: number,
  total: number,
  siblingCount: number,
  boundaryCount: number,
): (number | "ellipsis")[] {
  if (total < 1) {
    return [];
  }
  const maxButtons = boundaryCount * 2 + siblingCount * 2 + 2;
  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  for (let i = 1; i <= boundaryCount; i++) {
    pages.add(i);
  }
  for (let i = total - boundaryCount + 1; i <= total; i++) {
    pages.add(i);
  }
  for (let i = current - siblingCount; i <= current + siblingCount; i++) {
    if (i >= 1 && i <= total) {
      pages.add(i);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev > 0 && n - prev > 1) {
      out.push("ellipsis");
    }
    out.push(n);
    prev = n;
  }
  return out;
}

/** Range summary + numbered page controls (ellipsis) + first/prev/next/last — common admin-table pattern. */
export function TablePagination({
  total,
  page,
  totalPages,
  pageSize,
  onPageChange,
  disabled = false,
  siblingCount = 1,
  boundaryCount = 1,
  className = "",
}: TablePaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);

  const fromIdx = total <= 0 ? 0 : (safePage - 1) * pageSize + 1;
  const toIdx = total <= 0 ? 0 : Math.min(safePage * pageSize, total);

  const hasMultiplePages = safeTotalPages > 1;
  const navDisabled = disabled || total <= 0 || !hasMultiplePages;

  const pageItems = useMemo(
    () => getPaginationRange(safePage, safeTotalPages, siblingCount, boundaryCount),
    [safePage, safeTotalPages, siblingCount, boundaryCount],
  );

  return (
    <div
      className={`flex flex-col gap-3 border-t border-border/50 px-4 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="min-w-0 shrink-0 tabular-nums">
        {total <= 0 ? (
          <>Showing {fmtCount(0)}–{fmtCount(0)} of {fmtCount(0)}</>
        ) : (
          <>
            Showing {fmtCount(fromIdx)}–{fmtCount(toIdx)} of {fmtCount(total)}
          </>
        )}
      </p>

      <nav
        className="flex min-w-0 flex-wrap items-center justify-center gap-0.5 sm:justify-end sm:gap-1"
        aria-label="Pagination"
      >
        <Button
          type="button"
          variant="ghost"
          className="h-9 shrink-0 px-1.5 sm:px-2"
          disabled={navDisabled || safePage <= 1}
          aria-label="First page"
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-9 shrink-0 px-2"
          disabled={navDisabled || safePage <= 1}
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </Button>

        <div className="mx-0.5 max-w-[min(100%,20rem)] min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-1 sm:max-w-[min(100%,24rem)] sm:flex-initial [&::-webkit-scrollbar]:hidden">
          <ul className="flex items-center justify-center gap-0.5 px-0.5 sm:justify-center">
            {total <= 0 ? (
              <li>
                <span
                  className="flex h-9 min-w-9 items-center justify-center rounded-lg text-xs text-muted"
                  aria-hidden
                >
                  —
                </span>
              </li>
            ) : (
              pageItems.map((item, idx) =>
                item === "ellipsis" ? (
                  <li key={`e-${idx}`}>
                    <span
                      className="flex h-9 min-w-8 items-center justify-center select-none px-0.5 text-muted"
                      aria-hidden
                    >
                      …
                    </span>
                  </li>
                ) : (
                  <li key={item}>
                    <Button
                      type="button"
                      variant="ghost"
                      className={`h-9 min-w-9 px-2 text-xs font-medium tabular-nums ${
                        item === safePage
                          ? "bg-primary/15 text-primary ring-1 ring-primary/25 hover:bg-primary/18"
                          : "text-foreground"
                      }`}
                      disabled={navDisabled}
                      aria-label={`Page ${fmtCount(item)}`}
                      aria-current={item === safePage ? "page" : undefined}
                      onClick={() => onPageChange(item)}
                    >
                      {fmtCount(item)}
                    </Button>
                  </li>
                ),
              )
            )}
          </ul>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="h-9 shrink-0 px-2"
          disabled={navDisabled || safePage >= safeTotalPages}
          aria-label="Next page"
          onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-9 shrink-0 px-1.5 sm:px-2"
          disabled={navDisabled || safePage >= safeTotalPages}
          aria-label="Last page"
          onClick={() => onPageChange(safeTotalPages)}
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </Button>
      </nav>
    </div>
  );
}
