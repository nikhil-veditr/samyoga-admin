import { Skeleton } from "@/components/atoms/skeleton";

type PageHeaderSkeletonProps = {
  withDescription?: boolean;
  withActions?: boolean;
  className?: string;
};

export function PageHeaderSkeleton({
  withDescription = true,
  withActions = false,
  className = "",
}: PageHeaderSkeletonProps) {
  return (
    <div className={`flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${className}`.trim()}>
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-7 w-48 max-w-[55%]" />
        {withDescription ? (
          <>
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-[80%] max-w-lg" />
          </>
        ) : null}
      </div>
      {withActions ? (
        <div className="flex shrink-0 flex-wrap gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      ) : null}
    </div>
  );
}
