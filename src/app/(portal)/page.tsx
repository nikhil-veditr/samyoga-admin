"use client";

import Link from "next/link";
import { Building2, PlusCircle, Puzzle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TableCard } from "@/components/atoms/table-card";
import { useAuthStore } from "@/shared/store/auth-store";
import { useMyProfileQuery } from "@/services/me/me.hooks";
import { useInternalTenantsQuery } from "@/services/internal/internal.hooks";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: profile, isPending } = useMyProfileQuery();
  const { data: tenants, isPending: tenantsPending } = useInternalTenantsQuery();

  const displayName =
    [profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName].filter(Boolean).join(" ") ||
    profile?.email ||
    user?.email ||
    "Operator";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <section className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted">Signed in as</p>
        <p className="mt-1 font-heading text-xl font-semibold text-foreground">
          {isPending ? "Loading…" : displayName}
        </p>
        <p className="mt-2 text-sm text-muted">Super admin · full platform access</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Link
          href="/features"
          className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <Puzzle className="h-8 w-8 text-primary" aria-hidden />
          <h2 className="mt-3 font-heading font-semibold text-foreground">Platform features</h2>
          <p className="mt-1 text-sm text-muted">Enable or disable modules for all tenants</p>
        </Link>
        <Link
          href="/tenants"
          className="rounded-lg border border-border bg-card p-5 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <Building2 className="h-8 w-8 text-primary" aria-hidden />
          <h2 className="mt-3 font-heading font-semibold text-foreground">Manage tenants</h2>
          <p className="mt-1 text-sm text-muted">View hospitals and workspace slugs</p>
        </Link>
        <Link
          href="/tenants/new"
          className="rounded-lg border border-border bg-card p-5 transition hover:border-secondary/50 hover:bg-secondary/10"
        >
          <PlusCircle className="h-8 w-8 text-secondary" aria-hidden />
          <h2 className="mt-3 font-heading font-semibold text-foreground">Provision tenant</h2>
          <p className="mt-1 text-sm text-muted">Create hospital, features, and first admin</p>
        </Link>
      </div>

      <TableCard shellClassName="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-base font-semibold text-foreground">Recent tenants</h2>
          <Link href="/tenants/new">
            <Button type="button">Add tenant</Button>
          </Link>
        </div>
        {tenantsPending ? (
          <p className="text-sm text-muted">Loading tenants…</p>
        ) : tenants && tenants.length > 0 ? (
          <ul className="divide-y divide-border">
            {tenants.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-foreground">{t.name}</span>
                <span className="text-muted">{t.slug}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No tenants yet. Provision your first hospital.</p>
        )}
        {tenants && tenants.length > 5 ? (
          <Link href="/tenants" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            View all tenants
          </Link>
        ) : null}
      </TableCard>
    </div>
  );
}
