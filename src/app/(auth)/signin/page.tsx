"use client";

import { Suspense } from "react";
import { motion } from "motion/react";
import { AuthSignInForm } from "@/components/organisms/auth-signin-form";
import { AdminAuthCardShell } from "@/components/molecules/admin-auth-card-shell";
import { AuthFormSkeleton } from "@/components/molecules/skeletons/admin-page-skeletons";

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-10%] top-[10%] h-[min(360px,45vw)] w-[min(360px,45vw)] rounded-full bg-secondary/12 blur-3xl dark:bg-secondary/16" />
        <div className="absolute bottom-[5%] left-[-15%] h-[min(320px,40vw)] w-[min(320px,40vw)] rounded-full bg-primary/8 blur-3xl dark:bg-primary/12" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-1 w-full flex justify-center"
      >
        <AdminAuthCardShell>
          <Suspense fallback={<AuthFormSkeleton />}>
            <AuthSignInForm />
          </Suspense>
        </AdminAuthCardShell>
      </motion.div>
    </main>
  );
}
