import { Skeleton } from "@/components/atoms/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl space-y-6 p-4 md:p-6"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <section className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-40" />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="mb-3 h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
