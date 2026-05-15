/**
 * Keeps the pagination footer on the client page during React Query placeholder / keepPreviousData
 * transitions so the active page does not jump while refetching.
 */
export function resolveListPageForTable(
  serverPagination: { page: number } | null | undefined,
  isPlaceholderData: boolean,
  clientPage: number,
): number {
  return serverPagination && !isPlaceholderData ? serverPagination.page : clientPage;
}
