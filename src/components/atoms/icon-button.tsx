import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Accessible name — icon-only buttons must have a label. */
  label: string;
  children: ReactNode;
};

export function IconButton({ label, type = "button", className = "", children, ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border/70 bg-card/80 text-foreground shadow-sm transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
