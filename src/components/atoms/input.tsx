import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", type, ...props },
  ref,
) {
  const searchCancelClass = type === "search" ? "input-search-cancel-themed" : "";
  return (
    <input
      ref={ref}
      type={type}
      className={`w-full rounded-xl border border-border/90 bg-card px-3.5 py-2.5 text-sm text-foreground shadow-[inset_0_1px_2px_var(--bezel-shadow)] outline-none ring-primary/25 transition-[border-color,box-shadow] duration-200 placeholder:text-muted/90 focus:border-primary/45 focus:shadow-[inset_0_1px_2px_var(--bezel-shadow),0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)] focus:ring-0 dark:border-border/70 ${searchCancelClass} ${className}`}
      {...props}
    />
  );
});
