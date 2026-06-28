"use client";

import type { ReactNode } from "react";
import { adminSurfaceElevatedClass } from "@/components/atoms/admin-surface";

export type TableCardProps = {
  children: ReactNode;
  /** Renders below the scroll region (e.g. pagination bar). */
  footer?: ReactNode;
  /** Extra classes on the horizontal scroll wrapper around `children`. */
  className?: string;
  /** Extra classes on the outer card shell. */
  shellClassName?: string;
  /**
   * When false, skips `overflow-x-auto` on the body wrapper (use when children manage their own
   * horizontal scroll, e.g. a carousel whose slides each scroll independently).
   */
  scrollOverflowX?: boolean;
};

/** Card shell + horizontal scroll for wide tables; optional footer (pagination, totals). */
export function TableCard({
  children,
  footer,
  className = "",
  shellClassName = "",
  scrollOverflowX = true,
}: TableCardProps) {
  const bodyClass = scrollOverflowX
    ? `overflow-x-auto ${className}`.trim()
    : `min-w-0 ${className}`.trim();

  return (
    <div
      className={`overflow-hidden ${adminSurfaceElevatedClass} ${shellClassName}`}
    >
      <div className={bodyClass}>{children}</div>
      {footer}
    </div>
  );
}
