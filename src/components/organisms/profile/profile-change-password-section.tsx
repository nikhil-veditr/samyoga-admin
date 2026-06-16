"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Input } from "@/components/atoms/input";
import { PROFILE_PASSWORD_SECTION_ID } from "@/components/organisms/profile/profile-passkeys.shared";
import { useChangePasswordMutation } from "@/services/auth/auth.hooks";
import { fieldSchemas } from "@/shared/lib/form/field-schemas";
import { useZodForm } from "@/shared/lib/form/zod-form";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: fieldSchemas.password(),
    confirmPassword: z.string().min(1, "Confirm your new password"),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

type PasswordFieldProps = {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

function PasswordField({ id, label, autoComplete, error, value, onChange, onBlur }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className="pr-11"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-background/80 hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} strokeWidth={1.75} aria-hidden /> : <Eye size={18} strokeWidth={1.75} aria-hidden />}
        </button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function ProfileChangePasswordSection() {
  const changePassword = useChangePasswordMutation();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useZodForm<ChangePasswordFormValues>({
    schema: changePasswordSchema,
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: values.revokeOtherSessions,
    });
    form.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: values.revokeOtherSessions,
    });
  });

  const { errors } = form.formState;

  return (
    <section
      id={PROFILE_PASSWORD_SECTION_ID}
      className="scroll-mt-6 space-y-4 rounded-xl border border-border/70 bg-card/60 p-5 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Password</h2>
          <p className="mt-0.5 text-xs text-muted">Enter your current password to set a new one.</p>
        </div>
      </div>

      <form ref={formRef} className="space-y-4" onSubmit={onSubmit} noValidate>
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field }) => (
            <PasswordField
              id="profile-current-password"
              label="Current password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={form.control}
          render={({ field }) => (
            <PasswordField
              id="profile-new-password"
              label="New password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field }) => (
            <PasswordField
              id="profile-confirm-password"
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        <Controller
          name="revokeOtherSessions"
          control={form.control}
          render={({ field }) => (
            <Checkbox
              id="profile-revoke-sessions"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              align="start"
            >
              <span className="text-sm text-foreground">Sign out of other devices</span>
              <span className="mt-0.5 block text-xs text-muted">
                Ends active sessions on other browsers and devices after your password is updated.
              </span>
            </Checkbox>
          )}
        />

        <Button type="submit" disabled={changePassword.isPending}>
          {changePassword.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Updating password…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </section>
  );
}
