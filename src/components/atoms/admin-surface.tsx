import type { ElementType, ReactNode } from "react";

export const adminSurfaceClass =
  "rounded-2xl border border-border/70 bg-card/40 shadow-[0_8px_32px_-12px_var(--bezel-shadow)] ring-1 ring-inset ring-(--bezel-highlight) dark:bg-card/25";

export const adminSurfaceElevatedClass =
  `${adminSurfaceClass} bg-card/55 dark:bg-card/35`;

type AdminSurfaceProps = {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  as?: ElementType;
  id?: string;
};

export function AdminSurface({
  children,
  className = "",
  elevated = false,
  as: Component = "div",
  id,
}: AdminSurfaceProps) {
  const base = elevated ? adminSurfaceElevatedClass : adminSurfaceClass;
  return (
    <Component id={id} className={`${base} ${className}`.trim()}>
      {children}
    </Component>
  );
}
