"use client";

import { useEffect, useRef, useState } from "react";

/** Default delay when `delayMs` is omitted (server-friendly; pass a lower value for live search). */
export const DEFAULT_DEBOUNCE_MS = 1000;

export type UseDebouncedValueOptions<T> = {
  /** Runs when the debounced value updates after `delayMs` (only if it actually changed). */
  onCommit?: (next: T) => void;
};

/** Debounces a value for list filters and similar (e.g. server search). Defaults to {@link DEFAULT_DEBOUNCE_MS}. */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = DEFAULT_DEBOUNCE_MS,
  options?: UseDebouncedValueOptions<T>,
): T {
  const [debounced, setDebounced] = useState(value);
  const committedRef = useRef(value);
  const onCommitRef = useRef(options?.onCommit);

  useEffect(() => {
    onCommitRef.current = options?.onCommit;
  }, [options?.onCommit]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (committedRef.current !== value) {
        committedRef.current = value;
        onCommitRef.current?.(value);
      }
      setDebounced(value);
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
