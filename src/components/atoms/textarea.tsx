import { forwardRef, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={`w-full resize-y rounded-xl border border-border/90 bg-card px-3.5 py-2.5 text-sm text-foreground shadow-[inset_0_1px_2px_var(--bezel-shadow)] outline-none ring-primary/25 transition-[border-color,box-shadow] duration-200 placeholder:text-muted/90 focus:border-primary/45 focus:shadow-[inset_0_1px_2px_var(--bezel-shadow),0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)] focus:ring-0 dark:border-border/70 ${className}`}
      {...props}
    />
  );
});
