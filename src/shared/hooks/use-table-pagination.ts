"use client";

import { useCallback, useState } from "react";
import { DEFAULT_TABLE_PAGE_SIZE } from "@/shared/constants/pagination";

export type UseTablePaginationReturn = {
  page: number;
  limit: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  /** Reset to page 1 (e.g. when filters or debounced search change). */
  resetPage: () => void;
  /** Apply a new page size and reset to page 1. */
  setPageSize: (next: number) => void;
};

export function useTablePagination(initialLimit: number = DEFAULT_TABLE_PAGE_SIZE): UseTablePaginationReturn {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const setPageSize = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  return { page, limit, setPage, setLimit, resetPage, setPageSize };
}
