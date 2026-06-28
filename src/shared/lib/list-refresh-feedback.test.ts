import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { completeListRefresh } from "./list-refresh-feedback";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("completeListRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toasts success when refetch succeeds", async () => {
    await completeListRefresh(async () => ({ isError: false }), {
      successMessage: "List updated",
    });
    expect(toast.success).toHaveBeenCalledWith("List updated");
  });

  it("toasts error when refetch fails", async () => {
    await completeListRefresh(async () => ({ isError: true }));
    expect(toast.error).toHaveBeenCalled();
  });
});
