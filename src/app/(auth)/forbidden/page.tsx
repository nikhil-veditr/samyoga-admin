import Link from "next/link";
import { Button } from "@/components/atoms/button";

export default function ForbiddenPage() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-center">
      <h1 className="font-heading text-xl font-semibold text-foreground">Access restricted</h1>
      <p className="mt-2 text-sm text-muted">
        This portal is for Samyoga platform operators only. Hospital staff should use the HMS app instead.
      </p>
      <Link href="/signin" className="mt-6 inline-block">
        <Button variant="secondary" type="button">
          Back to sign in
        </Button>
      </Link>
    </div>
  );
}
