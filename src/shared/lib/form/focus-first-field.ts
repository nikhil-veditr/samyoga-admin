import { useEffect, type RefObject } from "react";

/** First text-like control in a container (skips hidden/disabled and aria-hidden subtrees). */
export const FIRST_FIELD_SELECTOR =
  'input:not([type="hidden"]):not([disabled]):not([aria-hidden="true"]), select:not([disabled]), textarea:not([disabled])';

export function focusFirstFieldIn(container: HTMLElement | null): void {
  if (!container) return;
  const fields = container.querySelectorAll<HTMLElement>(FIRST_FIELD_SELECTOR);
  for (const el of fields) {
    if (el.closest('[aria-hidden="true"]')) continue;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;
    el.focus({ preventScroll: false });
    return;
  }
}

/** Focus the first field when a page-level form mounts (modals use `Modal` auto-focus). */
export function useFocusFirstFieldOnMount(
  containerRef: RefObject<HTMLElement | null>,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => focusFirstFieldIn(containerRef.current), 50);
    return () => window.clearTimeout(timer);
  }, [enabled, containerRef]);
}
