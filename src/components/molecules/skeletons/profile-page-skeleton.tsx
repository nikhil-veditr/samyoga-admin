import { FormSectionSkeleton } from "@/components/molecules/skeletons/form-section-skeleton";
import { Skeleton } from "@/components/atoms/skeleton";

export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6" aria-busy="true" aria-label="Loading profile">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <FormSectionSkeleton key={i} fields={i === 0 ? 4 : 2} />
      ))}
    </div>
  );
}
