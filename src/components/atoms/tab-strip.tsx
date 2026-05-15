"use client";

import { useEffect, useRef } from "react";

export type TabStripItem<T extends string = string> = {
  id: T;
  label: string;
  /** Optional second line under the label */
  hint?: string;
};

export type TabStripProps<T extends string = string> = {
  items: readonly TabStripItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** `aria-label` for the tab list */
  ariaLabel: string;
  /** If set, each tab button gets `id` = `{idPrefix}-tab-{id}` for pairing with `aria-controls` on tab panels */
  idPrefix?: string;
  className?: string;
};

/**
 * Horizontal tab row: **does not wrap** — on narrow viewports the list scrolls horizontally
 * (`overflow-x-auto`, touch momentum, thin scrollbar) so every tab stays readable.
 */
export function TabStrip<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  className = "",
}: TabStripProps<T>) {
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [value]);

  return (
    <div className={`min-w-0 border-b border-border/60 pb-2 ${className}`.trim()}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="app-scroll-x -mx-1 flex min-w-0 flex-nowrap snap-x snap-mandatory gap-2 px-1 [-webkit-overflow-scrolling:touch] overscroll-x-contain scroll-smooth"
      >
        {items.map((item) => {
          const selected = value === item.id;
          const tabId = idPrefix ? `${idPrefix}-tab-${item.id}` : undefined;
          return (
            <button
              key={item.id}
              id={tabId}
              ref={selected ? selectedRef : undefined}
              type="button"
              role="tab"
              aria-selected={selected}
              title={item.hint}
              className={`shrink-0 snap-start rounded-2xl border px-4 py-2.5 text-left text-sm font-medium transition-[color,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                selected
                  ? "border-primary/40 bg-primary/12 text-primary"
                  : "border-transparent text-muted hover:bg-muted/40 hover:text-foreground"
              }`}
              onClick={() => onChange(item.id)}
            >
              <span className="block whitespace-nowrap">{item.label}</span>
              {item.hint ? (
                <span className="mt-0.5 block max-w-56 text-[11px] font-normal leading-snug opacity-90 sm:max-w-64">
                  {item.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
