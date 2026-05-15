"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useOnClickOutside } from "@/shared/hooks/use-on-click-outside";

type Align = "start" | "end";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
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
  const toggle = useCallback(() => setOpen((o) => !o), []);

  useOnClickOutside(rootRef, () => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

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
  const { open, toggle } = useDropdownMenuContext();
  return (
    <button
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
};

export function DropdownMenuContent({
  align = "end",
  children,
  className = "",
  role = "menu",
}: DropdownMenuContentProps) {
  const { open } = useDropdownMenuContext();
  const alignClass = align === "end" ? "right-0" : "left-0";
  const origin = align === "end" ? "top right" : "top left";

  if (!open) return null;

  return (
    <div
      role={role}
      style={{ transformOrigin: origin }}
      className={`absolute ${alignClass} z-60 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card py-1 shadow-md ${className}`.trim()}
    >
      {children}
    </div>
  );
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
