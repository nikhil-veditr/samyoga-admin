/** Public asset paths under `/public` — swap files without touching components. */
export const BRANDING = {
  logoMarkSvg: "/logo.svg",
  logoMarkRaster: "/logo.webp",
  logoWordmarkPng: "/samyoga_long_transparent.png",
  /**
   * Horizontal start of the “Samyoga” word inside `logoWordmarkPng`, as % of total image width.
   * Used to align the tagline under the word, past the leaf mark. Retune if you replace the PNG.
   */
  logoWordmarkTextStartPercent: 28,
} as const;
