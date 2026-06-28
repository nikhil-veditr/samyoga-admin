"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const dropdownEase = [0.22, 1, 0.36, 1] as const;
const DROPDOWN_GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;

function isPortaledSelectMenuTarget(target: Node | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[class*="__menu"]'));
}

type Align = "start" | "end";

type DropdownPosition = { top: number; left: number };

function measureDropdownPosition(
  triggerRect: DOMRect,
  panelWidth: number,
  panelHeight: number,
  align: Align,
): DropdownPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = align === "end" ? triggerRect.right - panelWidth : triggerRect.left;
  left = Math.max(VIEWPORT_PADDING_PX, Math.min(left, vw - panelWidth - VIEWPORT_PADDING_PX));

  let top = triggerRect.bottom + DROPDOWN_GAP_PX;
  if (top + panelHeight > vh - VIEWPORT_PADDING_PX) {
    const aboveTop = triggerRect.top - DROPDOWN_GAP_PX - panelHeight;
    if (aboveTop >= VIEWPORT_PADDING_PX) top = aboveTop;
  }

  return { top, left };
}

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenuContext(): DropdownMenuContextValue {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) {
    throw new Error("useDropdownMenuContext must be used within DropdownMenu");
  }
  return ctx;
}

export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent | TouchEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (contentRef.current?.contains(target)) return;
      if (rootRef.current?.contains(target)) return;
      if (isPortaledSelectMenuTarget(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(
    () => ({ open, setOpen, toggle, triggerRef, contentRef }),
    [open, toggle],
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      <div className="relative" ref={rootRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  className = "",
  children,
  onClick,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  const { open, toggle, triggerRef } = useDropdownMenuContext();
  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) toggle();
      }}
      {...props}
      aria-expanded={open}
    >
      {children}
    </button>
  );
}

export function DropdownChevron({ className = "" }: { className?: string }) {
  const { open } = useDropdownMenuContext();
  return (
    <ChevronDown
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${className}`.trim()}
      aria-hidden
    />
  );
}

type DropdownMenuContentProps = {
  align?: Align;
  children: ReactNode;
  className?: string;
  role?: "menu" | "listbox" | "dialog";
  portaled?: boolean;
};

const dropdownPanelClass = (className: string) =>
  `overflow-hidden rounded-xl border border-border/70 bg-linear-to-br from-card to-background py-1 shadow-[0_16px_48px_-12px_var(--bezel-shadow),0_0_0_1px_var(--bezel-highlight)_inset] dark:border-border/55 ${className}`.trim();

export function DropdownMenuContent({
  align = "end",
  children,
  className = "",
  role = "menu",
  portaled = false,
}: DropdownMenuContentProps) {
  const { open, triggerRef, contentRef } = useDropdownMenuContext();
  const alignClass = align === "end" ? "right-0" : "left-0";
  const origin = align === "end" ? "top right" : "top left";
  const [position, setPosition] = useState<DropdownPosition>({ top: 0, left: 0 });

  const runPosition = useCallback((): void => {
    const trigger = triggerRef.current;
    const panel = contentRef.current;
    if (!trigger || !panel) return;
    const triggerRect = trigger.getBoundingClientRect();
    setPosition(
      measureDropdownPosition(triggerRect, panel.offsetWidth, panel.offsetHeight, align),
    );
  }, [align, contentRef, triggerRef]);

  useLayoutEffect(() => {
    if (!open || !portaled) return;
    runPosition();
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => runPosition());
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [open, portaled, runPosition, children]);

  useEffect(() => {
    if (!open || !portaled) return;
    runPosition();
    const onScrollOrResize = (): void => {
      runPosition();
    };
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, portaled, runPosition]);

  const panel = open ? (
    <motion.div
      key="dropdown-panel"
      ref={contentRef}
      role={role}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.22, ease: dropdownEase }}
      style={
        portaled
          ? { transformOrigin: origin, top: position.top, left: position.left, zIndex: "var(--z-index-select-menu)" }
          : { transformOrigin: origin }
      }
      className={
        portaled
          ? `fixed ${dropdownPanelClass(className)}`
          : `absolute ${alignClass} z-60 mt-1 ${dropdownPanelClass(className)}`
      }
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-px h-px bg-linear-to-r from-transparent via-primary/35 to-transparent dark:via-primary/25"
        aria-hidden
      />
      <div className="relative z-1">{children}</div>
    </motion.div>
  ) : null;

  if (portaled) {
    if (typeof document === "undefined") return null;
    return createPortal(<AnimatePresence>{panel}</AnimatePresence>, document.body);
  }

  return <AnimatePresence>{panel}</AnimatePresence>;
}

export function DropdownMenuItem({
  className = "",
  role = "menuitem",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role={role}
      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      {...props}
    />
  );
}

export function DropdownMenuItemDanger({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      {...props}
    />
  );
}

export function DropdownMenuLink({
  className = "",
  role = "menuitem",
  ...props
}: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      role={role}
      className={`flex items-center gap-2 px-3 py-2.5 text-sm text-foreground transition hover:bg-primary/10 ${className}`.trim()}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p
      role="presentation"
      className={`px-3 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted ${className}`.trim()}
    >
      {children}
    </p>
  );
}

export function DropdownMenuGroup({
  children,
  className = "",
  label,
  bordered = false,
}: {
  children: ReactNode;
  className?: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`py-1 ${bordered ? "border-t border-border/60" : ""} ${className}`.trim()}
    >
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      {children}
    </div>
  );
}
