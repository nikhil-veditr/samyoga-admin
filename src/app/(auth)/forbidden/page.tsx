import Link from "next/link";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/atoms/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/90 p-8 text-center shadow-[0_8px_32px_-12px_var(--bezel-shadow),0_0_0_1px_var(--bezel-highlight)_inset]">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <ShieldOff className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="font-heading text-xl font-semibold text-foreground">Access restricted</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          This portal is for Samyoga platform operators only. Hospital staff should use the HMS app instead.
        </p>
        <Link href="/signin" className="mt-6 inline-block">
          <Button variant="secondary" type="button">
            Back to sign in
          </Button>
        </Link>
      </div>
    </main>
  );
}
