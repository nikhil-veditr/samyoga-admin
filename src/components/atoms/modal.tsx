"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { focusFirstFieldIn } from "@/shared/lib/form/focus-first-field";

const overlayEase = [0.22, 1, 0.36, 1] as const;
const overlayTransition = { duration: 0.22, ease: overlayEase };
const panelSpring = { type: "spring" as const, damping: 30, stiffness: 340, mass: 0.85 };
const drawerSpring = { type: "spring" as const, damping: 30, stiffness: 320, mass: 0.85 };
const sheetSpring = { type: "spring" as const, damping: 34, stiffness: 380, mass: 0.9 };

function subscribeSmUp(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(min-width: 640px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSmUpSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(min-width: 640px)").matches;
}

export function useSmUp(): boolean {
  return useSyncExternalStore(subscribeSmUp, getSmUpSnapshot, () => false);
}

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

const sizeToResponsiveMaxW: Record<ModalSize, string> = {
  sm: "max-w-none sm:max-w-sm",
  md: "max-w-none sm:max-w-md",
  lg: "max-w-none sm:max-w-lg",
  xl: "max-w-none sm:max-w-xl",
  "2xl": "max-w-none sm:max-w-2xl",
  "3xl": "max-w-none sm:max-w-3xl",
  full: "max-w-none w-full sm:max-w-[min(120rem,calc(100vw-2rem))]",
};

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  presenceKey?: string;
  variant?: "center" | "right";
  size?: ModalSize;
  zClass?: string;
  overlayClassName?: string;
  panelClassName?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  closeDisabled?: boolean;
  lockScroll?: boolean;
  bodyScrollable?: boolean;
  autoFocusFirstField?: boolean;
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
  bodyScrollable = true,
  autoFocusFirstField = true,
  role = "dialog",
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}: ModalProps) {
  const smUp = useSmUp();
  const stacked = Boolean(header || footer);
  const panelRef = useRef<HTMLDivElement>(null);

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
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [open, closeOnEscape, closeDisabled, onOpenChange]);

  useEffect(() => {
    if (!open || !autoFocusFirstField) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) focusFirstFieldIn(panelRef.current);
    }, 50);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, presenceKey, autoFocusFirstField]);

  const overlayBaseCenter =
    variant === "center"
      ? `fixed inset-0 flex items-end justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:items-center ${
          size === "full" ? "sm:p-2" : "sm:p-4"
        } ${zClass}`
      : "";

  const overlayBase =
    variant === "center"
      ? overlayBaseCenter
      : `fixed inset-0 flex justify-end bg-black/50 backdrop-blur-[2px] ${zClass}`;

  const maxHeightCenter =
    size === "full"
      ? "max-h-[min(98dvh,100dvh)] sm:max-h-[min(96vh,calc(100vh-2rem))]"
      : "max-h-[min(90dvh,100dvh)] sm:max-h-[min(92vh,calc(100vh-2rem))]";
  const roundingCenter = "rounded-t-2xl rounded-b-none sm:rounded-2xl sm:rounded-b-2xl";
  const ringCard = "bg-card shadow-2xl ring-1 ring-black/5 dark:bg-card dark:ring-white/10";

  const panelBaseCenterSimple = stacked
    ? `flex min-h-0 w-full flex-col overflow-visible border border-border/70 ${ringCard} ${sizeToResponsiveMaxW[size]} ${maxHeightCenter} ${roundingCenter}`
    : `app-scroll-y w-full border border-border/70 p-6 ${ringCard} ${sizeToResponsiveMaxW[size]} ${maxHeightCenter} ${roundingCenter} pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6`;

  const panelBaseRight = stacked
    ? `flex min-h-0 h-full w-full max-w-md flex-col overflow-visible border-l border-border/60 bg-card shadow-2xl ring-1 ring-black/5 dark:bg-card dark:ring-white/10`
    : "flex h-full w-full max-w-md flex-col overflow-hidden border-l border-border/60 bg-card shadow-2xl ring-1 ring-black/5 dark:bg-card dark:ring-white/10";

  const panelMotionCenterDesktop = {
    initial: { opacity: 0, y: 22, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 16, scale: 0.98 },
    transition: panelSpring,
  };

  const panelMotionCenterMobileSheet = {
    initial: { opacity: 1, y: "100%" },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 1, y: "100%" },
    transition: sheetSpring,
  };

  const panelMotionCenter = smUp ? panelMotionCenterDesktop : panelMotionCenterMobileSheet;

  const panelMotionRight = {
    initial: { x: "104%", opacity: 0.98 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "104%", opacity: 0.98 },
    transition: drawerSpring,
  };

  const panelMotion = variant === "center" ? panelMotionCenter : panelMotionRight;
  const panelBase = variant === "center" ? panelBaseCenterSimple : panelBaseRight;

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
          <div
            className={`min-h-0 flex-1 px-6 ${centerScrollPadding} ${
              bodyScrollable ? "overflow-y-auto app-scroll-y" : "flex flex-col overflow-hidden"
            }`}
          >
            {children}
          </div>
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
    typeof document !== "undefined" ? (
      <AnimatePresence>
        {open ? (
          <motion.div
            key={presenceKey}
            className={`${overlayBase} ${overlayClassName}`.trim()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={(e) => {
              if (e.target !== e.currentTarget) return;
              if (!closeOnBackdrop || closeDisabled) return;
              onOpenChange(false);
            }}
          >
            <motion.div
              ref={panelRef}
              role={role}
              aria-modal="true"
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
              className={`${panelBase} ${panelClassName}`.trim()}
              {...panelMotion}
              onClick={(e) => e.stopPropagation()}
            >
              {panelInner}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null;

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
