export type ListTableLoadingInput = {
  isPending: boolean;
  isFetching: boolean;
  isError?: boolean;
  rowCount: number;
};

export type ListTableLoadingState = {
  controlsBusy: boolean;
  showInitialSkeleton: boolean;
  showEmptyState: boolean;
};

export function resolveListTableLoading({
  isPending,
  isFetching,
  isError = false,
  rowCount,
}: ListTableLoadingInput): ListTableLoadingState {
  const controlsBusy = isFetching && !isError;
  const showInitialSkeleton = isPending && rowCount === 0 && !isError;
  const showEmptyState = rowCount === 0 && !showInitialSkeleton && !isError;

  return { controlsBusy, showInitialSkeleton, showEmptyState };
}

export type ListRefreshButtonState = {
  busy: boolean;
  spinning: boolean;
};

export function resolveListRefreshButton({
  isPending,
  isFetching,
  isError = false,
}: Pick<ListTableLoadingInput, "isPending" | "isFetching" | "isError">): ListRefreshButtonState {
  const busy = isFetching && !isError;
  const spinning = isFetching && !isPending && !isError;
  return { busy, spinning };
}
