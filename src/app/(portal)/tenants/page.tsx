"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { TableCard } from "@/components/atoms/table-card";
import { useInternalTenantsQuery } from "@/services/internal/internal.hooks";

export default function TenantsPage() {
  const { data: tenants, isPending } = useInternalTenantsQuery();

  return (
    <div className="mx-auto max-w-4xl">
      <TableCard shellClassName="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">All tenants</h2>
            <p className="mt-1 text-sm text-muted">Active hospital workspaces on the platform</p>
          </div>
          <Link href="/tenants/new">
            <Button type="button">
              <Plus className="mr-2 h-4 w-4" />
              Provision tenant
            </Button>
          </Link>
        </div>
        {isPending ? (
          <p className="text-sm text-muted">Loading tenants…</p>
        ) : tenants && tenants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Slug</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">{t.name}</td>
                    <td className="py-3 pr-4 text-muted">{t.slug}</td>
                    <td className="py-3 capitalize text-muted">{t.status.toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">No tenants yet.</p>
        )}
      </TableCard>
    </div>
  );
}
