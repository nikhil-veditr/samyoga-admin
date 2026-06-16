"use client";

import { toast } from "sonner";
import { authClient } from "@/shared/lib/auth/auth-client";
import { useAppMutation } from "@/shared/lib/react-query/hooks";
import { queryClient } from "@/shared/lib/react-query/query-client";
import { useAuthStore } from "@/shared/store/auth-store";
import type { SignInPayload } from "./auth.api";

/** Ends Better Auth session (cookies) and clears local UI auth snapshot. */
export async function signOutApp(): Promise<void> {
  await authClient.signOut();
  useAuthStore.getState().clearAuth();
  queryClient.removeQueries({ queryKey: ["me"] });
  queryClient.removeQueries({ queryKey: ["internal"] });
}

export const useSignInMutation = () => {
  return useAppMutation({
    mutationKey: ["auth", "sign-in"],
    mutationFn: async (payload: SignInPayload) => {
      const result = await authClient.signIn.email({
        email: payload.email,
        password: payload.password,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Sign-in failed");
      }

      return result.data;
    },
    onSuccess: (data) => {
      // When 2FA is required, Better Auth returns `{ twoFactorRedirect: true }`
      // and handles the redirect to `/two-factor`.
      if (!data || !("twoFactorRedirect" in data) || data.twoFactorRedirect !== true) {
        toast.success("Signed in");
      }
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions: boolean;
};

export const useChangePasswordMutation = () => {
  return useAppMutation({
    mutationKey: ["auth", "change-password"],
    mutationFn: async (payload: ChangePasswordPayload) => {
      const result = await authClient.changePassword({
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        revokeOtherSessions: payload.revokeOtherSessions,
      });

      if (result.error) {
        throw new Error(result.error.message ?? "Could not change password");
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success("Password updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
};
