"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/button";
import { TableCard } from "@/components/atoms/table-card";
import {
  useInternalUserFeedbackQuery,
  useUpdateInternalUserFeedbackMutation,
} from "@/services/internal/internal.hooks";
import type {
  InternalUserFeedbackItem,
  UserFeedbackStatus,
} from "@/services/internal/internal.types";

const STATUS_OPTIONS: UserFeedbackStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "FIXED",
  "WONT_FIX",
  "CLOSED",
];

const STATUS_LABELS: Record<UserFeedbackStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  FIXED: "Fixed",
  WONT_FIX: "Won't fix",
  CLOSED: "Closed",
};

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function FeedbackRow({ item }: { item: InternalUserFeedbackItem }) {
  const update = useUpdateInternalUserFeedbackMutation();
  const [notes, setNotes] = useState(item.adminNotes ?? "");
  const route =
    item.context && typeof item.context.route === "string" ? item.context.route : null;

  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-foreground">{item.summary}</p>
        {item.details ? <p className="mt-1 text-xs text-muted">{item.details}</p> : null}
        {route ? (
          <p className="mt-1 font-mono text-[10px] text-muted">{route}</p>
        ) : null}
      </td>
      <td className="py-3 pr-4 text-muted">
        <p>{item.tenantName}</p>
        <p className="font-mono text-[10px]">{item.tenantSlug}</p>
      </td>
      <td className="py-3 pr-4 text-muted">
        <p>{item.reporterName ?? item.reporterEmail}</p>
        <p className="text-[10px]">{item.category.replace(/_/g, " ")}</p>
        <p className="text-[10px] capitalize">{item.severity.toLowerCase().replace(/_/g, " ")}</p>
      </td>
      <td className="py-3 pr-4">
        <select
          className="rounded-lg border border-border/70 bg-background px-2 py-1 text-xs"
          value={item.status}
          disabled={update.isPending}
          onChange={(e) => {
            void update.mutateAsync({
              id: item.id,
              status: e.target.value as UserFeedbackStatus,
            });
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-muted">{formatWhen(item.createdAt)}</p>
      </td>
      <td className="py-3 min-w-[12rem]">
        <textarea
          className="min-h-[72px] w-full rounded-lg border border-border/70 bg-background px-2 py-1.5 text-xs"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes"
        />
        <Button
          type="button"
          variant="ghost"
          className="mt-1 px-2 py-1 text-xs"
          disabled={update.isPending || notes === (item.adminNotes ?? "")}
          onClick={() => {
            void update.mutateAsync({ id: item.id, adminNotes: notes.trim() || null });
          }}
        >
          Save notes
        </Button>
      </td>
    </tr>
  );
}

export function FeedbackPanel() {
  const [statusFilter, setStatusFilter] = useState<UserFeedbackStatus | "ALL">("OPEN");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page,
    }),
    [statusFilter, page],
  );

  const { data, isPending } = useInternalUserFeedbackQuery(filters);
  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <TableCard shellClassName="p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">User feedback</h2>
          <p className="mt-1 text-sm text-muted">
            Reports from HMS users during pilot — triage status and add internal notes.
          </p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </span>
          <select
            className="rounded-lg border border-border/70 bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserFeedbackStatus | "ALL");
              setPage(1);
            }}
          >
            <option value="ALL">All</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isPending ? (
        <p className="text-sm text-muted">Loading feedback…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No feedback items for this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-2 pr-4 font-medium">Issue</th>
                <th className="py-2 pr-4 font-medium">Tenant</th>
                <th className="py-2 pr-4 font-medium">Reporter</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Admin notes</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <FeedbackRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </TableCard>
  );
}
