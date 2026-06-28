"use client";

import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { SelectField } from "@/components/atoms/select-field";
import { TableCard } from "@/components/atoms/table-card";
import { TablePagination } from "@/components/atoms/table-pagination";
import { Textarea } from "@/components/atoms/textarea";
import { ListEmptyState } from "@/components/molecules/list-empty-state";
import { ListPageHeaderActions } from "@/components/molecules/list-page-header-actions";
import { ListPageRefreshButton } from "@/components/molecules/list-page-refresh-button";
import { ListTableErrorRow } from "@/components/molecules/list-load-error-state";
import { TableSkeleton } from "@/components/molecules/skeletons/table-skeleton";
import { AdminFeedbackRouteLink } from "@/components/organisms/admin-feedback-route-link";
import { createAdminFormatters } from "@/shared/lib/datetime/admin-datetime";
import { completeListRefresh } from "@/shared/lib/list-refresh-feedback";
import { resolveListPageForTable } from "@/shared/lib/resolve-list-page-for-table";
import {
  resolveListRefreshButton,
  resolveListTableLoading,
} from "@/shared/lib/resolve-list-table-loading";
import { useTablePagination } from "@/shared/hooks/use-table-pagination";
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

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
];

const adminFormatters = createAdminFormatters();

function FeedbackRow({ item }: { item: InternalUserFeedbackItem }) {
  const update = useUpdateInternalUserFeedbackMutation();
  const [notes, setNotes] = useState(item.adminNotes ?? "");
  const route =
    item.context && typeof item.context.route === "string" ? item.context.route : null;

  const statusOptions = STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] }));
  const statusValue = statusOptions.find((o) => o.value === item.status) ?? null;

  return (
    <tr className="border-b border-border/60 align-top last:border-0">
      <td className="py-3 pr-4">
        <p className="font-medium text-foreground">{item.summary}</p>
        {item.details ? <p className="mt-1 text-xs text-muted">{item.details}</p> : null}
        {route ? <AdminFeedbackRouteLink route={route} /> : null}
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
        <SelectField
          options={statusOptions}
          value={statusValue}
          isDisabled={update.isPending}
          onChange={(opt) => {
            if (!opt) return;
            void update.mutateAsync({
              id: item.id,
              status: opt.value as UserFeedbackStatus,
            });
          }}
          className="min-w-[9rem] text-xs"
        />
        <p className="mt-1 text-[10px] text-muted">{adminFormatters.formatDateTime(item.createdAt)}</p>
      </td>
      <td className="min-w-[12rem] py-3">
        <Textarea
          className="min-h-[72px] text-xs"
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
  const pagination = useTablePagination(25);

  const filters = useMemo(
    () => ({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page: pagination.page,
    }),
    [statusFilter, pagination.page],
  );

  const { data, isPending, isFetching, isError, isPlaceholderData, refetch } =
    useInternalUserFeedbackQuery(filters);
  const items = data?.items ?? [];
  const serverPagination = data?.pagination;

  const rowCount = items.length;
  const { controlsBusy, showInitialSkeleton, showEmptyState } = useMemo(
    () =>
      resolveListTableLoading({
        isPending,
        isFetching,
        isError,
        rowCount,
      }),
    [isPending, isFetching, isError, rowCount],
  );
  const refreshState = resolveListRefreshButton({ isPending, isFetching, isError });

  const activePage = resolveListPageForTable(serverPagination, isPlaceholderData, pagination.page);
  const totalPages = serverPagination?.totalPages ?? 1;
  const total = serverPagination?.total ?? 0;
  const pageSize = serverPagination?.limit ?? pagination.limit;

  const statusFilterOption =
    STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter) ?? STATUS_FILTER_OPTIONS[0];

  return (
    <div className="mx-auto max-w-6xl">
      <TableCard
        shellClassName="p-6"
        footer={
          totalPages > 1 ? (
            <TablePagination
              total={total}
              page={activePage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={pagination.setPage}
              disabled={controlsBusy}
            />
          ) : undefined
        }
      >
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">User feedback</h2>
            <p className="mt-1 text-sm text-muted">
              Reports from HMS users during pilot — triage status and add internal notes.
            </p>
          </div>
          <ListPageHeaderActions>
            <div className="min-w-[10rem]">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
                Status
              </label>
              <SelectField
                options={STATUS_FILTER_OPTIONS}
                value={statusFilterOption}
                isDisabled={controlsBusy}
                onChange={(opt) => {
                  if (!opt) return;
                  setStatusFilter(opt.value as UserFeedbackStatus | "ALL");
                  pagination.resetPage();
                }}
              />
            </div>
            <ListPageRefreshButton
              busy={refreshState.busy}
              spinning={refreshState.spinning}
              onClick={() =>
                void completeListRefresh(refetch, {
                  successMessage: "Feedback list updated",
                  errorMessage: "Could not refresh feedback",
                })
              }
            />
          </ListPageHeaderActions>
        </div>

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
              {isError ? (
                <ListTableErrorRow
                  colSpan={5}
                  message="Could not load feedback."
                  onRetry={() => void refetch()}
                />
              ) : showInitialSkeleton ? (
                <TableSkeleton rows={8} columns={5} asTableRows />
              ) : showEmptyState ? (
                <tr>
                  <td colSpan={5} className="p-0">
                    <ListEmptyState
                      icon={MessageSquare}
                      title="No feedback for this filter"
                      description="Try a different status filter or check back when HMS users submit reports."
                    />
                  </td>
                </tr>
              ) : (
                items.map((item) => <FeedbackRow key={item.id} item={item} />)
              )}
            </tbody>
          </table>
        </div>
      </TableCard>
    </div>
  );
}
