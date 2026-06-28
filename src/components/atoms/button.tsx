"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-white/10 hover:opacity-[0.97] hover:shadow-lg hover:shadow-primary/25 dark:shadow-primary/15 dark:ring-white/5",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm ring-1 ring-black/5 hover:opacity-[0.97] dark:ring-white/10",
  ghost:
    "border border-border/80 bg-background/40 text-foreground backdrop-blur-sm hover:bg-card/80 dark:bg-background/25",
  danger:
    "bg-danger text-white shadow-md shadow-danger/25 ring-1 ring-white/10 hover:opacity-[0.95] hover:shadow-lg hover:shadow-danger/30 dark:ring-white/5",
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const motionHover =
    variant === "danger" || variant === "ghost" ? { y: 0, scale: 1 } : { y: -1 };
  return (
    <motion.button
      whileHover={motionHover}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
