/** Shared layout for admin header account dropdown trigger. */
export const adminAccountSwitcherTriggerBase =
  "flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left shadow-sm backdrop-blur-sm transition outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 md:gap-2.5 md:px-3 md:py-2";

export const adminAccountSwitcherTriggerAppearance =
  "border-secondary/40 bg-secondary/10 ring-1 ring-inset ring-secondary/20 hover:border-secondary/55 hover:bg-secondary/15";

export const adminAccountSwitcherTrigger = `${adminAccountSwitcherTriggerBase} ${adminAccountSwitcherTriggerAppearance}`;

export const adminAccountSwitcherMobileCompact =
  "max-md:h-9 max-md:w-9 max-md:min-h-0 max-md:justify-center max-md:gap-0 max-md:px-0 max-md:py-0";

export const adminAccountSwitcherLabelClass =
  "block text-[10px] font-semibold uppercase tracking-wider text-muted";

export const adminAccountSwitcherNameClass =
  "truncate text-sm font-semibold tracking-tight text-foreground";

export const adminAccountSwitcherChevronClass = "h-3.5 w-3.5 shrink-0 self-center text-muted";
