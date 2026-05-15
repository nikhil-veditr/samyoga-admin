"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

/** Full-width sheet on small viewports; max width applies from `sm` and up. */
const sizeToResponsiveMaxW: Record<ModalSize, string> = {
  sm: "max-w-none sm:max-w-sm",
  md: "max-w-none sm:max-w-md",
  lg: "max-w-none sm:max-w-lg",
  xl: "max-w-none sm:max-w-xl",
  "2xl": "max-w-none sm:max-w-2xl",
  "3xl": "max-w-none sm:max-w-3xl",
  /** Near viewport width/height for dense editors (e.g. lab reports). */
  full: "max-w-none w-full sm:max-w-[min(120rem,calc(100vw-2rem))]",
};

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  /** Fixed top region (does not scroll). Use with scrollable `children` and optional `footer`. */
  header?: ReactNode;
  /** Fixed bottom actions (does not scroll). Laid out in a row, end-aligned (right in LTR). */
  footer?: ReactNode;
  /** AnimatePresence / layout key — change when swapping modal context (e.g. role id). */
  presenceKey?: string;
  /** Centered card vs right-edge drawer. */
  variant?: "center" | "right";
  /** Max width of the panel (center variant only). */
  size?: ModalSize;
  /** Stacking segment — theme utilities `z-dialog`, `z-sheet`, … from `globals.css` (`--z-index-*`). */
  zClass?: string;
  /** Extra classes on the dimmed overlay shell (includes flex alignment). */
  overlayClassName?: string;
  /** Extra classes on the panel (merged after defaults; use `p-0` to drop default padding). */
  panelClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /** When true, backdrop / Escape do not dismiss (e.g. pending submit). */
  closeDisabled?: boolean;
  lockScroll?: boolean;
  role?: "dialog" | "alertdialog";
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

export function Modal({
  open,
  onOpenChange,
  children,
  header,
  footer,
  presenceKey = "modal",
  variant = "center",
  size = "md",
  zClass = "z-dialog",
  overlayClassName = "",
  panelClassName = "",
  closeOnBackdrop = true,
  closeOnEscape = true,
  closeDisabled = false,
  lockScroll = true,
  role = "dialog",
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: ModalProps) {
  const stacked = Boolean(header || footer);

  useEffect(() => {
    if (!open || !lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, lockScroll]);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && !closeDisabled) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, closeDisabled, onOpenChange]);

  const overlayBaseCenter =
    variant === "center"
      ? `fixed inset-0 flex items-end justify-center bg-black/40 p-0 sm:items-center ${
          size === "full" ? "sm:p-2" : "sm:p-4"
        } ${zClass}`
      : "";

  const overlayBase =
    variant === "center"
      ? overlayBaseCenter
      : `fixed inset-0 flex justify-end bg-black/40 ${zClass}`;

  /** Center: bottom sheet on narrow viewports, centered card from sm+. */
  const maxHeightCenter =
    size === "full"
      ? "max-h-[min(98dvh,100dvh)] sm:max-h-[min(96vh,calc(100vh-2rem))]"
      : "max-h-[min(90dvh,100dvh)] sm:max-h-[min(92vh,calc(100vh-2rem))]";
  const roundingCenter = "rounded-t-md rounded-b-none sm:rounded-md sm:rounded-b-md";
  const ringCard = "border border-border bg-card shadow-md";

  /** No `overflow-hidden` on the panel shell — it clips focus rings / hover glow on footer actions. Clipping stays on the header+body stack only. */
  const panelBaseCenterSimple = stacked
    ? `flex min-h-0 w-full flex-col overflow-visible border border-border/70 ${ringCard} ${sizeToResponsiveMaxW[size]} ${maxHeightCenter} ${roundingCenter}`
    : `app-scroll-y w-full border border-border/70 p-6 ${ringCard} ${sizeToResponsiveMaxW[size]} ${maxHeightCenter} ${roundingCenter} pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6`;

  const panelBaseRight = stacked
    ? "flex min-h-0 h-full w-full max-w-md flex-col overflow-visible border-l border-border bg-card shadow-md"
    : "flex h-full w-full max-w-md flex-col overflow-hidden border-l border-border bg-card shadow-md";

  const panelBase = variant === "center" ? panelBaseCenterSimple : panelBaseRight;

  /** Top stack clips scroll overflow and top radius; footer stays `overflow-visible` so focus/hover outlines are not cut off. */
  const centerScrollPadding = header ? "pt-2 pb-5" : "pt-6 pb-5";
  const centerBodyShellClass = footer
    ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-2xl"
    : "flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-2xl sm:rounded-b-2xl";

  const panelInner =
    stacked && variant === "center" ? (
      <>
        <div className={centerBodyShellClass}>
          {header ? (
            <div className="shrink-0 border-b border-border/60 px-6 pt-6 pb-4 dark:border-border/50">{header}</div>
          ) : null}
          <div className={`min-h-0 flex-1 overflow-y-auto app-scroll-y px-6 ${centerScrollPadding}`}>{children}</div>
        </div>
        {footer ? (
          <div className="shrink-0 rounded-b-none border-t border-border/60 bg-card px-6 pt-4 pb-[max(0.75rem,calc(0.75rem+env(safe-area-inset-bottom)))] dark:border-border/50 sm:rounded-b-2xl sm:pb-4">
            <div className="flex flex-row flex-wrap justify-end gap-2">{footer}</div>
          </div>
        ) : null}
      </>
    ) : stacked && variant === "right" ? (
      <>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {header ? <div className="shrink-0 border-b border-border/60 px-4 pt-4 pb-3">{header}</div> : null}
          <div className={`min-h-0 flex-1 overflow-y-auto app-scroll-y px-4 ${header ? "pt-2 pb-5" : "pt-4 pb-5"}`}>
            {children}
          </div>
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-border/60 bg-card px-4 py-3 dark:border-border/50">
            <div className="flex flex-row flex-wrap justify-end gap-2">{footer}</div>
          </div>
        ) : null}
      </>
    ) : (
      children
    );

  const node =
    typeof document !== "undefined" && open ? (
      <div
        key={presenceKey}
        className={`${overlayBase} ${overlayClassName}`.trim()}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          if (!closeOnBackdrop || closeDisabled) return;
          onOpenChange(false);
        }}
      >
        <div
          role={role}
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className={`${panelBase} ${panelClassName}`.trim()}
          onClick={(e) => e.stopPropagation()}
        >
          {panelInner}
        </div>
      </div>
    ) : null;

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
