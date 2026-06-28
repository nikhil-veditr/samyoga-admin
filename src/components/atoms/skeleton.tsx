type SkeletonProps = {
  className?: string;
};

/** Shimmer placeholder block — use for layout-sized loading states. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border/55 dark:bg-border/45 ${className}`.trim()}
      aria-hidden
    />
  );
}
