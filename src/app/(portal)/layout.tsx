import { AdminShell } from "@/components/organisms/app-shell/admin-shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
