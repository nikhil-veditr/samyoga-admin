"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

export type ListPageHeaderActionsProps = {
  children: ReactNode;
  className?: string;
};

function isRenderable(child: ReactNode): boolean {
  return child !== null && child !== undefined && child !== false;
}

function mergeClassName(base: string | undefined, extra: string): string {
  return [base, extra].filter(Boolean).join(" ");
}

/**
 * Primary list header actions (Refresh, create, export, …): uses the full row width on small
 * screens — one column when there is a single control, two columns when there are two or more.
 * From `lg`, switches to a compact horizontal layout.
 */
export function ListPageHeaderActions({ children, className = "" }: ListPageHeaderActionsProps) {
  const items = Children.toArray(children).filter(isRenderable);
  if (items.length === 0) return null;

  const mobileCols = items.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div
      className={`grid w-full shrink-0 gap-2 ${mobileCols} lg:flex lg:w-auto lg:shrink-0 lg:flex-row lg:flex-wrap lg:items-stretch lg:justify-end lg:gap-2 ${className}`.trim()}
    >
      {items.map((child, i) => {
        const spanWhenOdd =
          items.length > 1 && items.length % 2 === 1 && i === items.length - 1 ? "max-lg:col-span-2" : "";
        if (!isValidElement(child)) {
          return (
            <div key={i} className={`min-w-0 ${spanWhenOdd}`.trim()}>
              {child}
            </div>
          );
        }
        const el = child as ReactElement<{ className?: string }>;
        return cloneElement(el, {
          key: el.key ?? `header-action-${i}`,
          className: mergeClassName(
            el.props.className,
            `w-full min-w-0 justify-center lg:w-auto ${spanWhenOdd}`.trim(),
          ),
        });
      })}
    </div>
  );
}
