import { Skeleton } from "@/components/atoms/skeleton";

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  asTableRows?: boolean;
  className?: string;
};

export function TableSkeleton({
  rows = 5,
  columns = 5,
  asTableRows = false,
  className = "",
}: TableSkeletonProps) {
  if (asTableRows) {
    return (
      <>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex} className="border-b border-border/40 last:border-0">
            {Array.from({ length: columns }, (_, colIndex) => (
              <td key={colIndex} className="px-4 py-3">
                <Skeleton
                  className={`h-4 ${colIndex === 0 ? "w-28" : colIndex === columns - 1 ? "ml-auto w-16" : "w-full max-w-[8rem]"}`}
                />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }

  return (
    <div className={`space-y-2 ${className}`.trim()} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-lg" />
      ))}
    </div>
  );
}
