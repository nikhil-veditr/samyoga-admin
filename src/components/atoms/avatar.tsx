import type { HTMLAttributes } from "react";

type AvatarSize = "sm" | "md" | "lg";

const sizeClass: Record<AvatarSize, string> = {
  sm: "h-7 w-7 rounded-md text-[10px]",
  md: "h-9 w-9 rounded-lg text-xs",
  lg: "h-11 w-11 rounded-xl text-sm",
};

type AvatarProps = {
  initials: string;
  size?: AvatarSize;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

/** Round initials badge (no image URL yet — swap later for `next/image` when profiles store photos). */
export function Avatar({ initials, size = "md", className = "", ...props }: AvatarProps) {
  const text = initials.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-primary/15 font-semibold text-primary ${sizeClass[size]} ${className}`.trim()}
      aria-hidden
      {...props}
    >
      {text}
    </span>
  );
}
