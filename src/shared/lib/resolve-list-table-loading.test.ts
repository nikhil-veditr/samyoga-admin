import { describe, expect, it } from "vitest";
import { resolveListRefreshButton, resolveListTableLoading } from "./resolve-list-table-loading";

describe("resolveListTableLoading", () => {
  it("shows inline skeleton only on first pending load", () => {
    const state = resolveListTableLoading({
      isPending: true,
      isFetching: true,
      rowCount: 0,
    });
    expect(state.showInitialSkeleton).toBe(true);
    expect(state.showEmptyState).toBe(false);
  });

  it("shows empty state when loaded with zero rows", () => {
    const state = resolveListTableLoading({
      isPending: false,
      isFetching: false,
      rowCount: 0,
    });
    expect(state.showEmptyState).toBe(true);
    expect(state.showInitialSkeleton).toBe(false);
  });
});

describe("resolveListRefreshButton", () => {
  it("spins on background refetch", () => {
    expect(resolveListRefreshButton({ isPending: false, isFetching: true })).toEqual({
      busy: true,
      spinning: true,
    });
  });
});
