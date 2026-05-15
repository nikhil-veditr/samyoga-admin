"use client";

import { useMemo } from "react";
import { format, parse, isValid, endOfDay, subYears } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import {
  DropdownChevron,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useDropdownMenuContext,
} from "@/components/atoms/dropdown-menu";
import { Button } from "@/components/atoms/button";

const STORAGE_FORMAT = "yyyy-MM-dd";

function parseYmd(value: string): Date | undefined {
  const t = value.trim();
  if (!t) return undefined;
  const d = parse(t, STORAGE_FORMAT, new Date());
  return isValid(d) ? d : undefined;
}

function formatYmd(date: Date): string {
  return format(date, STORAGE_FORMAT, { locale: enUS });
}

type DatePickerDropdownPanelProps = {
  selected: Date | undefined;
  defaultMonth: Date;
  fromYear: number;
  toYear: number;
  disabled: boolean;
  allowClear: boolean;
  value: string;
  onChange: (next: string) => void;
};

function DatePickerDropdownPanel({
  selected,
  defaultMonth,
  fromYear,
  toYear,
  disabled,
  allowClear,
  value,
  onChange,
}: DatePickerDropdownPanelProps) {
  const { setOpen } = useDropdownMenuContext();

  const startMonth = useMemo(() => new Date(fromYear, 0, 1), [fromYear]);
  const endMonth = useMemo(() => new Date(toYear, 11, 31), [toYear]);

  return (
    <div className="date-picker-rdp text-foreground" data-date-picker-panel>
      <DayPicker
        mode="single"
        required={false}
        locale={enUS}
        weekStartsOn={1}
        captionLayout="dropdown"
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={defaultMonth}
        selected={selected}
        disabled={disabled ? true : { after: endOfDay(new Date()) }}
        onSelect={(date) => {
          if (disabled) return;
          if (date) {
            onChange(formatYmd(date));
            setOpen(false);
          } else if (allowClear) {
            onChange("");
            setOpen(false);
          }
        }}
        role="application"
        className="font-sans p-2 text-sm leading-snug [--rdp-day-height:2.25rem] [--rdp-day-width:2.25rem] [--rdp-day_button-height:2.125rem] [--rdp-day_button-width:2.125rem] [--rdp-outline:0]"
      />
      {allowClear && !disabled && value.trim() ? (
        <div className="border-t border-border/60 px-2 pb-2 pt-1.5">
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-full justify-center text-xs text-muted hover:text-foreground"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            Clear date
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export type DatePickerFieldProps = {
  id?: string;
  /** `YYYY-MM-DD` or empty string */
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** First year shown in year dropdown */
  fromYear?: number;
  /** Last year shown in year dropdown */
  toYear?: number;
  /** Show clear control (e.g. optional DOB on profile) */
  allowClear?: boolean;
  className?: string;
  "aria-labelledby"?: string;
};

export function DatePickerField({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  fromYear = 1900,
  toYear,
  allowClear = false,
  className = "",
  "aria-labelledby": ariaLabelledBy,
}: DatePickerFieldProps) {
  const toYearResolved = toYear ?? new Date().getFullYear();
  const selected = useMemo(() => parseYmd(value), [value]);
  /** Empty DOB: open around a typical birth year, not the current month (avoids a wall of disabled future days). */
  const defaultMonth = useMemo(
    () => selected ?? subYears(new Date(), 25),
    [selected],
  );

  const displayLabel = selected
    ? format(selected, "MMM d, yyyy", { locale: enUS })
    : placeholder;

  const triggerClass =
    "flex h-[42px] w-full min-w-0 items-center gap-2 rounded-xl border border-border/90 bg-card px-3.5 py-2 text-left text-sm text-foreground shadow-[inset_0_1px_2px_var(--bezel-shadow)] outline-none ring-primary/25 transition-[border-color,box-shadow] duration-200 placeholder:text-muted/90 focus:border-primary/45 focus:shadow-[inset_0_1px_2px_var(--bezel-shadow),0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)] focus:ring-0 dark:border-border/70 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={id}
        disabled={disabled}
        aria-labelledby={ariaLabelledBy}
        className={`${triggerClass} ${className}`.trim()}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-foreground" : "text-muted"}`}>{displayLabel}</span>
        <DropdownChevron className="h-4 w-4 shrink-0 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-auto min-w-[280px] p-0" role="dialog">
        <DatePickerDropdownPanel
          selected={selected}
          defaultMonth={defaultMonth}
          fromYear={fromYear}
          toYear={toYearResolved}
          disabled={disabled}
          allowClear={allowClear}
          value={value}
          onChange={onChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
