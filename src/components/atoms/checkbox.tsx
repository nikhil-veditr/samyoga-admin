"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import { Check } from "lucide-react";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  /** Visible label / description next to the control */
  children?: ReactNode;
  /** `center` (default): single-line labels sit on the box midline. `start`: top-align for multi-line label blocks. */
  align?: "start" | "center";
};

/**
 * Flat, theme-native checkbox — no inset “bezel”; calm borders; primary fill only when checked.
 */
export function Checkbox({ id, className = "", children, disabled, checked, align = "center", ...rest }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const alignItems = align === "start" ? "items-start" : "items-center";
  const boxRowOffset = align === "start" ? "mt-[2px]" : "";

  return (
    <label
      htmlFor={inputId}
      className={`group flex cursor-pointer ${alignItems} gap-3.5 ${disabled ? "cursor-not-allowed opacity-55" : ""} ${className}`.trim()}
    >
      <span className={`relative flex shrink-0 ${boxRowOffset}`.trim()}>
        <input
          id={inputId}
          type="checkbox"
          disabled={disabled}
          checked={checked}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden
          className="flex size-[1.125rem] shrink-0 items-center justify-center rounded-[5px] border border-border/90 bg-card shadow-[0_1px_0_var(--bezel-highlight)] transition-[border-color,background-color,box-shadow,transform] duration-150 ease-out peer-not-checked:group-hover:border-primary/55 peer-not-checked:group-hover:bg-primary/[0.1] peer-not-checked:group-hover:shadow-none dark:border-border/65 dark:bg-card/90 dark:shadow-[inset_0_1px_0_var(--bezel-highlight)] dark:peer-not-checked:group-hover:border-primary/60 dark:peer-not-checked:group-hover:bg-primary/[0.16] peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/45 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:cursor-not-allowed peer-disabled:opacity-60 peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-none peer-checked:peer-not-disabled:group-hover:border-primary peer-checked:peer-not-disabled:group-hover:bg-primary peer-checked:peer-not-disabled:group-hover:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_45%,transparent)] dark:peer-checked:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary-foreground)_14%,transparent)] dark:peer-checked:peer-not-disabled:group-hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary-foreground)_22%,transparent),0_0_0_2px_color-mix(in_srgb,var(--primary)_50%,transparent)] [&>svg]:scale-90 [&>svg]:text-primary-foreground [&>svg]:opacity-0 [&>svg]:transition-[opacity,transform] [&>svg]:duration-150 [&>svg]:ease-out peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100"
        >
          <Check className="size-2.5" strokeWidth={3} aria-hidden />
        </span>
      </span>
      {children ? <span className="min-w-0 flex-1 select-none leading-snug">{children}</span> : null}
    </label>
  );
}
