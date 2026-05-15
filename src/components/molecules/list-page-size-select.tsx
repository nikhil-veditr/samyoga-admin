"use client";

import { TablePageSizeSelect, type TablePageSizeSelectProps } from "@/components/atoms/table-page-size-select";
import type { UseTablePaginationReturn } from "@/shared/hooks/use-table-pagination";

export type ListPageSizeSelectProps = Omit<TablePageSizeSelectProps, "pageSize" | "onPageSizeChange"> & {
  pagination: Pick<UseTablePaginationReturn, "limit" | "setPageSize">;
};

/** Rows-per-page control wired to {@link useTablePagination}. */
export function ListPageSizeSelect({ pagination, ...rest }: ListPageSizeSelectProps) {
  return (
    <TablePageSizeSelect
      pageSize={pagination.limit}
      onPageSizeChange={pagination.setPageSize}
      {...rest}
    />
  );
}
