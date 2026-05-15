import { Suspense } from "react";
import { AuthSignInForm } from "@/components/organisms/auth-signin-form";

export default function SignInPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <AuthSignInForm />
    </Suspense>
  );
}
