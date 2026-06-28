import { toast } from "sonner";

export type ListRefreshFeedbackMessages = {
  successMessage?: string;
  errorMessage?: string;
};

type RefetchResult = { isError: boolean };

const DEFAULT_SUCCESS = "List updated";
const DEFAULT_ERROR = "Could not refresh list";

export async function completeListRefresh(
  refetch: () => Promise<RefetchResult>,
  messages: ListRefreshFeedbackMessages = {},
): Promise<void> {
  const { successMessage = DEFAULT_SUCCESS, errorMessage = DEFAULT_ERROR } = messages;

  const result = await refetch();
  if (result.isError) {
    toast.error(errorMessage);
    return;
  }
  toast.success(successMessage);
}
