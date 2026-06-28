import { Skeleton } from "@/components/atoms/skeleton";
import { PageHeaderSkeleton } from "@/components/molecules/skeletons/page-header-skeleton";
import { TableSkeleton } from "@/components/molecules/skeletons/table-skeleton";

export type ListPageSkeletonProps = {
  ariaLabel?: string;
  filterFields?: number;
  tableRows?: number;
  withPagination?: boolean;
  className?: string;
};

export function ListPageSkeleton({
  ariaLabel = "Loading page",
  filterFields = 0,
  tableRows = 8,
  withPagination = true,
  className = "",
}: ListPageSkeletonProps) {
  return (
    <div
      className={`mx-auto max-w-6xl space-y-6 p-4 md:p-6 ${className}`.trim()}
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <PageHeaderSkeleton withActions />

      {filterFields > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: filterFields }, (_, i) => (
            <Skeleton key={i} className="h-10 w-36 rounded-lg" />
          ))}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40 shadow-sm dark:bg-card/20">
        <TableSkeleton rows={tableRows} className="p-4" />
        {withPagination ? (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
