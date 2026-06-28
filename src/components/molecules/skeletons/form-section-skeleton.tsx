import { Skeleton } from "@/components/atoms/skeleton";

type FormSectionSkeletonProps = {
  fields?: number;
  withTitle?: boolean;
  className?: string;
};

export function FormSectionSkeleton({
  fields = 4,
  withTitle = true,
  className = "",
}: FormSectionSkeletonProps) {
  return (
    <div
      className={`space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 md:p-5 ${className}`.trim()}
      aria-busy="true"
    >
      {withTitle ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      ) : null}
      <div className="space-y-3">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
