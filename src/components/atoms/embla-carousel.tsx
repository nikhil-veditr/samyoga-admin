"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from "embla-carousel";
import { Children, useEffect, useMemo } from "react";

const BASE_OPTIONS: EmblaOptionsType = {
  align: "start",
  containScroll: "trimSnaps",
  breakpoints: {
    "(min-width: 1024px)": { watchDrag: false },
  },
};

function mergeEmblaOptions(user?: EmblaOptionsType): EmblaOptionsType {
  if (!user) return { ...BASE_OPTIONS };
  return {
    ...BASE_OPTIONS,
    ...user,
    breakpoints: {
      ...BASE_OPTIONS.breakpoints,
      ...user.breakpoints,
    },
  };
}

export type EmblaCarouselProps = {
  /** Each direct child is wrapped as one slide */
  children: React.ReactNode;
  className?: string;
  viewportClassName?: string;
  containerClassName?: string;
  slideClassName?: string;
  options?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  /** Controlled snap index (e.g. tab strip + `scrollTo`) */
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  onApi?: (api: EmblaCarouselType | undefined) => void;
};

/**
 * Samyoga-styled viewport/track; behavior from [embla-carousel-react](https://www.embla-carousel.com/).
 * Default slide basis: full width (one panel per view; swipe or control via `selectedIndex`).
 */
export function EmblaCarousel({
  children,
  className = "",
  viewportClassName = "",
  containerClassName = "",
  slideClassName = "",
  options,
  plugins,
  selectedIndex,
  onSelectedIndexChange,
  onApi,
}: EmblaCarouselProps) {
  const mergedOptions = useMemo(() => mergeEmblaOptions(options), [options]);
  const [viewportRef, emblaApi] = useEmblaCarousel(mergedOptions, plugins);

  useEffect(() => {
    onApi?.(emblaApi);
    return () => {
      onApi?.(undefined);
    };
  }, [emblaApi, onApi]);

  useEffect(() => {
    if (emblaApi == null || selectedIndex === undefined) return;
    if (emblaApi.selectedScrollSnap() === selectedIndex) return;
    emblaApi.scrollTo(selectedIndex);
  }, [emblaApi, selectedIndex]);

  useEffect(() => {
    if (!emblaApi || !onSelectedIndexChange) return;
    const notify = () => onSelectedIndexChange(emblaApi.selectedScrollSnap());
    emblaApi.on("select", notify);
    emblaApi.on("reInit", notify);
    return () => {
      emblaApi.off("select", notify);
      emblaApi.off("reInit", notify);
    };
  }, [emblaApi, onSelectedIndexChange]);

  const slides = Children.toArray(children);

  return (
    <div className={`min-h-0 min-w-0 ${className}`.trim()}>
      <div
        className={`overflow-hidden [-webkit-tap-highlight-color:transparent] ${viewportClassName}`.trim()}
        ref={viewportRef}
      >
        <div className={`flex min-h-0 touch-pan-y gap-6 ${containerClassName}`.trim()}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`min-h-0 min-w-0 shrink-0 grow-0 basis-full ${slideClassName}`.trim()}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
