import { Skeleton } from "@/components/atoms/skeleton";

export function AuthFormSkeleton() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4 py-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-sm" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}
