"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { ThemeCycleControl } from "@/components/molecules/theme-cycle-control";
import { authClient } from "@/shared/lib/auth/auth-client";
import { isSuperAdminUser } from "@/shared/lib/auth/session-user";
import { useSignInMutation } from "@/services/auth/auth.hooks";
import { fetchMyProfile } from "@/services/me/me.api";
import { fieldSchemas } from "@/shared/lib/form/field-schemas";
import { useZodForm } from "@/shared/lib/form/zod-form";
import { z } from "zod";

const signInSchema = z.object({
  email: fieldSchemas.email(),
  password: fieldSchemas.password(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function AuthSignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const form = useZodForm<SignInFormValues>({
    schema: signInSchema,
    defaultValues: { email: "", password: "" },
  });
  const signIn = useSignInMutation();

  const onSubmit = form.handleSubmit(async (values) => {
    await signIn.mutateAsync(values);
    await authClient.getSession();

    const sessionUser = (await authClient.getSession()).data?.user;
    let allowed = isSuperAdminUser(sessionUser);
    if (!allowed) {
      try {
        const profile = await fetchMyProfile();
        allowed = profile.superAdmin === true;
      } catch {
        allowed = false;
      }
    }
    if (!allowed) {
      await authClient.signOut();
      router.replace("/forbidden");
      return;
    }

    const next = searchParams.get("next");
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/signin") ? next : "/";
    router.push(safeNext);
    router.refresh();
  });

  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-semibold text-foreground">Sign in</h2>
          <p className="mt-1 text-sm text-muted">Platform operators only</p>
        </div>
        <ThemeCycleControl />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            Email
          </label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email?.message && (
            <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
          {form.formState.errors.password?.message && (
            <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={signIn.isPending}>
          {signIn.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
