"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

const GAP = 8;
/** Chevron SVG width; paths/viewBox assume the same geometry. */
const ARROW_CHEVRON_WIDTH_PX = 14;
/** Chevron SVG height; keep in sync with path data. */
const ARROW_CHEVRON_HEIGHT_PX = 7;
/**
 * How far the chevron tucks **into** the content box at the shared edge (px).
 * Increase for a deeper “inside the card” seam; decrease toward 0 for a looser join.
 */
const ARROW_INTO_BOX_PX = 1;
/**
 * How much farther the tip sits **toward the trigger** past the default geometry (px).
 * When the tooltip is above the icon: positive = tail reaches **lower** (closer to the icon).
 * When the tooltip is below the icon: positive = tip reaches **higher** (closer to the icon).
 * Use 0 for the built-in length; increase to push the tip as far as you need along that axis.
 */
const ARROW_OUT_PX = 0;
/** Reserve vertical space so the tail + extension do not eat the gap to the trigger. */
const ARROW_PAST_BOX = ARROW_CHEVRON_HEIGHT_PX - ARROW_INTO_BOX_PX + ARROW_OUT_PX;
/** Subtle rounding at the two shoulders (where slants meet the flat edge). */
const ARROW_CORNER_RADIUS_PX = 0.65;
/**
 * Circular fillet at the tip only (px), separate from {@link ARROW_CORNER_RADIUS_PX}.
 * A quadratic at the tip looked like a missing corner; a small `A` arc keeps a real rounded point.
 */
const ARROW_TIP_FILLET_RADIUS_PX = 0.55;

type ChevronPaths = { fill: string; slantAndTipStroke: string };

const S45 = 1 / Math.SQRT2;

/** Down-pointing chevron (tooltip above trigger): flat top, tip at bottom center. */
function buildChevronDownRounded(w: number, h: number, rTop: number, rTip: number): ChevronPaths {
  const rt = Math.min(rTop, w * 0.2, h * 0.32, 2);
  const tip = Math.min(rTip, h * 0.42, w * 0.22, 1.35);
  const cx = w / 2;
  const dT = rt * S45;
  const p2x = cx + tip * S45;
  const p2y = h - tip * S45;
  const p1x = cx - tip * S45;
  const p1y = p2y;
  const fill = [
    `M ${rt},0`,
    `L ${w - rt},0`,
    `Q ${w},0 ${w - dT},${dT}`,
    `L ${p2x},${p2y}`,
    `A ${tip} ${tip} 0 0 1 ${p1x},${p1y}`,
    `L ${dT},${dT}`,
    `Q 0,0 ${rt},0`,
    "Z",
  ].join(" ");
  const slantAndTipStroke = [`M ${w - dT},${dT} L ${p2x},${p2y}`, `A ${tip} ${tip} 0 0 1 ${p1x},${p1y}`, `L ${dT},${dT}`].join(
    " ",
  );
  return { fill, slantAndTipStroke };
}

/** Up-pointing chevron (tooltip below trigger): tip at top, flat base at bottom. */
function buildChevronUpRounded(w: number, h: number, rTop: number, rTip: number): ChevronPaths {
  const rt = Math.min(rTop, w * 0.2, h * 0.32, 2);
  const tip = Math.min(rTip, h * 0.42, w * 0.22, 1.35);
  const cx = w / 2;
  const dT = rt * S45;
  const p1x = cx - tip * S45;
  const p1y = tip * S45;
  const p2x = cx + tip * S45;
  const p2y = p1y;
  const fill = [
    `M ${rt},${h}`,
    `L ${w - rt},${h}`,
    `Q ${w},${h} ${w - dT},${h - dT}`,
    `L ${p2x},${p2y}`,
    `A ${tip} ${tip} 0 0 0 ${p1x},${p1y}`,
    `L ${dT},${h - dT}`,
    `Q 0,${h} ${rt},${h}`,
    "Z",
  ].join(" ");
  const slantAndTipStroke = [`M ${dT},${h - dT} L ${p1x},${p1y}`, `A ${tip} ${tip} 0 0 0 ${p2x},${p2y}`, `L ${w - dT},${h - dT}`].join(
    " ",
  );
  return { fill, slantAndTipStroke };
}

const CHEVRON_DOWN_PATHS = buildChevronDownRounded(
  ARROW_CHEVRON_WIDTH_PX,
  ARROW_CHEVRON_HEIGHT_PX,
  ARROW_CORNER_RADIUS_PX,
  ARROW_TIP_FILLET_RADIUS_PX,
);
const CHEVRON_UP_PATHS = buildChevronUpRounded(
  ARROW_CHEVRON_WIDTH_PX,
  ARROW_CHEVRON_HEIGHT_PX,
  ARROW_CORNER_RADIUS_PX,
  ARROW_TIP_FILLET_RADIUS_PX,
);
/** Short grace period to move pointer from trigger → tooltip; Escape / outside click close immediately. */
const HIDE_MS = 90;

export type HintIconTooltipTone = "info" | "warning";

export type HintIconTooltipProps = {
  /** Tooltip body (and screen-reader copy when linked to a field). */
  children: ReactNode;
  tone?: HintIconTooltipTone;
  /** Short label for the trigger (screen readers). */
  ariaLabel: string;
  /**
   * When set, invisible help text uses this `id` so another element (e.g. search input) can use
   * `aria-describedby={theSameId}`. The trigger button then only uses `aria-label`.
   */
  descriptionIdFor?: string;
  className?: string;
  /** Horizontal alignment of the tooltip relative to the trigger. */
  align?: "start" | "center" | "end";
};

type Pos = { top: number; left: number; maxW: number; placement: "top" | "bottom"; arrowX: number };

function measurePosition(
  trigger: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  align: "start" | "center" | "end",
): Pos {
  const vw = typeof window === "undefined" ? 1024 : window.innerWidth;
  const vh = typeof window === "undefined" ? 768 : window.innerHeight;
  const tw = Math.min(tooltipWidth || 280, Math.min(320, vw - 24));
  const th = tooltipHeight || 64;

  /** Prefer above the trigger; flip below if there is not enough room at the top of the viewport. */
  let top = trigger.top - GAP - th - ARROW_PAST_BOX;
  if (top < 12) {
    const below = trigger.bottom + GAP + ARROW_PAST_BOX;
    if (below + th <= vh - 12) {
      top = below;
    } else {
      top = Math.max(12, Math.min(trigger.top - GAP - th - ARROW_PAST_BOX, vh - th - 12));
    }
  }

  let left: number;
  if (align === "start") left = trigger.left;
  else if (align === "end") left = trigger.right - tw;
  else left = trigger.left + trigger.width / 2 - tw / 2;

  left = Math.max(12, Math.min(left, vw - tw - 12));
  const maxW = Math.min(320, vw - 24);

  const placement: "top" | "bottom" = top >= trigger.bottom - 1 ? "bottom" : "top";

  const triggerCenter = trigger.left + trigger.width / 2;
  let arrowX = triggerCenter - left;
  arrowX = Math.max(ARROW_CHEVRON_WIDTH_PX, Math.min(arrowX, tw - ARROW_CHEVRON_WIDTH_PX));

  return { top, left, maxW, placement, arrowX };
}

/**
 * Info / warning icon; help text is shown in a portal tooltip (fixed layer) on hover or focus
 * so it is not clipped by modal overflow and stacks above dialogs.
 */
export function HintIconTooltip({
  children,
  tone = "info",
  ariaLabel,
  descriptionIdFor,
  className = "",
  align = "center",
}: HintIconTooltipProps) {
  const autoId = useId();
  const descId = descriptionIdFor ?? `${autoId}-hint-desc`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [layerMounted, setLayerMounted] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, maxW: 320, placement: "top", arrowX: 160 });

  const clearHide = useCallback((): void => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback((): void => {
    clearHide();
    hideTimerRef.current = setTimeout(() => setOpen(false), HIDE_MS);
  }, [clearHide]);

  const closeNow = useCallback((): void => {
    clearHide();
    setOpen(false);
  }, [clearHide]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const runPosition = useCallback((): void => {
    const btn = triggerRef.current;
    if (!btn) return;
    const tr = btn.getBoundingClientRect();
    const tip = tooltipRef.current;
    const tw = tip?.offsetWidth ?? 280;
    const th = tip?.offsetHeight ?? 72;
    setPos(measurePosition(tr, tw, th, align));
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    runPosition();
    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => runPosition());
    });
    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
    };
  }, [open, runPosition, children]);

  useEffect(() => {
    if (!open) return;
    runPosition();
    const onScrollOrResize = (): void => {
      runPosition();
    };
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, runPosition]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeNow();
      }
    };
    const onPointerDown = (e: PointerEvent): void => {
      const node = e.target as Node | null;
      if (!node) return;
      if (triggerRef.current?.contains(node)) return;
      if (tooltipRef.current?.contains(node)) return;
      closeNow();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open, closeNow]);

  useEffect(() => {
    return () => {
      clearHide();
      setLayerMounted(false);
    };
  }, [clearHide]);

  const Icon = tone === "warning" ? AlertTriangle : Info;
  const iconColor = tone === "warning" ? "text-secondary" : "text-primary";
  const focusRing =
    tone === "warning" ? "focus-visible:ring-secondary/50" : "focus-visible:ring-primary/50";

  const onTriggerEnter = (): void => {
    clearHide();
    setLayerMounted(true);
    setOpen(true);
  };
  const onTriggerLeave = (): void => {
    scheduleHide();
  };
  const onTooltipEnter = (): void => {
    clearHide();
  };
  const onTooltipLeave = (): void => {
    scheduleHide();
  };

  const portal =
    typeof document !== "undefined" &&
    layerMounted &&
    createPortal(
      open ? (
          <div
            ref={tooltipRef}
            role="tooltip"
            aria-hidden="true"
            style={{ top: pos.top, left: pos.left, maxWidth: pos.maxW }}
            onMouseEnter={onTooltipEnter}
            onMouseLeave={onTooltipLeave}
            className="pointer-events-auto fixed z-hint-tooltip rounded-md border border-border bg-card text-left text-sm text-foreground shadow-md"
          >
            {pos.placement === "top" ? (
              <svg
                aria-hidden
                width={ARROW_CHEVRON_WIDTH_PX}
                height={ARROW_CHEVRON_HEIGHT_PX}
                viewBox={`0 0 ${ARROW_CHEVRON_WIDTH_PX} ${ARROW_CHEVRON_HEIGHT_PX}`}
                className="pointer-events-none absolute z-0 overflow-visible"
                style={{
                  left: pos.arrowX,
                  bottom: -ARROW_INTO_BOX_PX,
                  transform: `translateX(-50%) translateY(calc(100% - ${ARROW_INTO_BOX_PX}px + ${ARROW_OUT_PX}px))`,
                }}
              >
                <path d={CHEVRON_DOWN_PATHS.fill} fill="var(--card)" />
                <path
                  d={CHEVRON_DOWN_PATHS.slantAndTipStroke}
                  fill="none"
                  stroke="var(--border)"
                  strokeOpacity={0.85}
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : (
              <svg
                aria-hidden
                width={ARROW_CHEVRON_WIDTH_PX}
                height={ARROW_CHEVRON_HEIGHT_PX}
                viewBox={`0 0 ${ARROW_CHEVRON_WIDTH_PX} ${ARROW_CHEVRON_HEIGHT_PX}`}
                className="pointer-events-none absolute z-0 overflow-visible"
                style={{
                  left: pos.arrowX,
                  top: -ARROW_INTO_BOX_PX,
                  transform: `translateX(-50%) translateY(calc(-100% + ${ARROW_INTO_BOX_PX}px - ${ARROW_OUT_PX}px))`,
                }}
              >
                <path d={CHEVRON_UP_PATHS.fill} fill="var(--card)" />
                <path
                  d={CHEVRON_UP_PATHS.slantAndTipStroke}
                  fill="none"
                  stroke="var(--border)"
                  strokeOpacity={0.85}
                  strokeWidth={1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}
            <div className="relative z-1 px-3 py-2 text-xs leading-snug">{children}</div>
          </div>
        ) : null,
      document.body,
    );

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span id={descId} className="sr-only">
        {children}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        {...(descriptionIdFor ? {} : { "aria-describedby": descId })}
        aria-expanded={open}
        onMouseEnter={onTriggerEnter}
        onMouseLeave={onTriggerLeave}
        onFocus={onTriggerEnter}
        onBlur={closeNow}
        className={`shrink-0 rounded-full p-1 text-muted outline-none transition hover:bg-foreground/6 hover:text-foreground disabled:opacity-40 ${focusRing} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-card`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} aria-hidden />
      </button>
      {portal}
    </div>
  );
}
