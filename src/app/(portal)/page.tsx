"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Building2, PlusCircle, Puzzle, Shield } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/atoms/button";
import { Skeleton } from "@/components/atoms/skeleton";
import { AdminSurface, adminSurfaceClass } from "@/components/atoms/admin-surface";
import { TableCard } from "@/components/atoms/table-card";
import { ListEmptyState } from "@/components/molecules/list-empty-state";
import { ListLoadErrorState } from "@/components/molecules/list-load-error-state";
import { TableSkeleton } from "@/components/molecules/skeletons/table-skeleton";
import { resolveListTableLoading } from "@/shared/lib/resolve-list-table-loading";
import { useAuthStore } from "@/shared/store/auth-store";
import { useMyProfileQuery } from "@/services/me/me.hooks";
import { useInternalTenantsQuery } from "@/services/internal/internal.hooks";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const quickActions = [
  {
    href: "/features",
    icon: Puzzle,
    title: "Platform features",
    description: "Enable or disable modules for all tenants",
    accent: "primary" as const,
  },
  {
    href: "/tenants",
    icon: Building2,
    title: "Manage tenants",
    description: "View hospitals and workspace slugs",
    accent: "primary" as const,
  },
  {
    href: "/tenants/new",
    icon: PlusCircle,
    title: "Provision tenant",
    description: "Create hospital, features, and first admin",
    accent: "secondary" as const,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const user = useAuthStore((s) => s.user);
  const { data: profile, isPending: profilePending } = useMyProfileQuery();
  const {
    data: tenants,
    isPending: tenantsPending,
    isFetching: tenantsFetching,
    isError: tenantsError,
    refetch: refetchTenants,
  } = useInternalTenantsQuery();

  const displayName =
    [profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName].filter(Boolean).join(" ") ||
    profile?.email ||
    user?.email ||
    "Operator";

  const rowCount = tenants?.length ?? 0;
  const { showInitialSkeleton, showEmptyState } = useMemo(
    () =>
      resolveListTableLoading({
        isPending: tenantsPending,
        isFetching: tenantsFetching,
        isError: tenantsError,
        rowCount,
      }),
    [tenantsPending, tenantsFetching, tenantsError, rowCount],
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <AdminSurface elevated className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Signed in as</p>
            {profilePending ? (
              <Skeleton className="mt-2 h-8 w-56" />
            ) : (
              <p className="mt-1 font-heading text-xl font-semibold text-foreground">{displayName}</p>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
                <Shield className="h-3 w-3" aria-hidden />
                Super admin
              </span>
              Full platform access
            </p>
          </div>
        </div>
      </AdminSurface>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {quickActions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.href}
              custom={i}
              initial={reducedMotion ? undefined : "hidden"}
              animate={reducedMotion ? undefined : "visible"}
              variants={fadeUp}
            >
              <Link
                href={action.href}
                className={`group block p-5 transition ${adminSurfaceClass} ${
                  action.accent === "secondary"
                    ? "hover:border-secondary/50 hover:bg-secondary/10"
                    : "hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <motion.span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                    action.accent === "secondary" ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary"
                  }`}
                  whileHover={reducedMotion ? undefined : { scale: 1.05, y: -2 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                </motion.span>
                <h2 className="mt-3 font-heading font-semibold text-foreground">{action.title}</h2>
                <p className="mt-1 text-sm text-muted">{action.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <TableCard shellClassName="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold text-foreground">Recent tenants</h2>
          <Link href="/tenants/new">
            <Button type="button">Add tenant</Button>
          </Link>
        </div>
        {tenantsError ? (
          <ListLoadErrorState message="Could not load tenants." onRetry={() => void refetchTenants()} />
        ) : showInitialSkeleton ? (
          <TableSkeleton rows={5} className="py-1" />
        ) : showEmptyState ? (
          <ListEmptyState
            icon={Building2}
            title="No tenants yet"
            description="Provision your first hospital workspace to get started."
            primaryAction={{
              label: "Provision tenant",
              onClick: () => router.push("/tenants/new"),
            }}
          />
        ) : tenants && tenants.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {tenants.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-foreground">{t.name}</span>
                <span className="font-mono text-xs text-muted">{t.slug}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {tenants && tenants.length > 5 ? (
          <Link href="/tenants" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            View all tenants
          </Link>
        ) : null}
      </TableCard>
    </div>
  );
}
