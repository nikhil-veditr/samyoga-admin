import { SamyogaLogoMark } from "@/components/atoms/samyoga-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-card px-6 py-4">
        <SamyogaLogoMark />
        <div>
          <p className="font-heading text-sm font-semibold text-foreground">Samyoga Admin</p>
          <p className="text-xs text-muted">Internal platform portal</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10">{children}</div>
    </div>
  );
}
