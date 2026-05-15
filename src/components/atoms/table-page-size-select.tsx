"use client";

import { useId, useMemo } from "react";
import { SelectField, type SelectOption } from "@/components/atoms/select-field";

const DEFAULT_PAGE_SIZES = [10, 25, 50] as const;

export type TablePageSizeSelectProps = {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
  label?: string;
  /** Extra classes on the outer row (label + control). */
  className?: string;
  /** Width wrapper around the select (default matches table toolbar). */
  selectWidthClassName?: string;
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Rows-per-page control (react-select) for use above a table next to filters. */
export function TablePageSizeSelect({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  disabled = false,
  label = "Rows per page",
  className = "",
  selectWidthClassName = "w-[5.5rem]",
}: TablePageSizeSelectProps) {
  const baseId = useId().replace(/:/g, "");

  const options: SelectOption[] = useMemo(() => {
    const merged = Array.from(new Set([...pageSizeOptions, pageSize])).sort((a, b) => a - b);
    return merged.map((n) => ({ value: String(n), label: String(n) }));
  }, [pageSizeOptions, pageSize]);

  const value = options.find((o) => o.value === String(pageSize)) ?? options[0] ?? null;

  return (
    <div className={`flex items-center gap-2 text-sm text-muted ${className}`}>
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide">{label}</span>
      <div className={`shrink-0 ${selectWidthClassName}`}>
        <SelectField
          inputId={`${baseId}-page-size`}
          aria-label={label}
          options={options}
          value={value}
          isSearchable={false}
          isDisabled={disabled}
          menuPlacement="auto"
          onChange={(opt) => {
            onPageSizeChange(parsePositiveInt(opt?.value, pageSize));
          }}
          classNamePrefix="table-page-size"
        />
      </div>
    </div>
  );
}
