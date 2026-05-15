"use client";

import { forwardRef, useId, useMemo, type ComponentRef, type Ref } from "react";
import Select, {
  mergeStyles,
  type GroupBase,
  type MultiValue,
  type Props as SelectProps,
  type SingleValue,
  type StylesConfig,
  type Theme,
} from "react-select";

export type SelectOption = { value: string; label: string };

type SelectFieldSingleProps = {
  isMulti?: false;
  options: SelectOption[];
  value: SelectOption | null;
  onChange: (value: SelectOption | null) => void;
} & Omit<
  SelectProps<SelectOption, false, GroupBase<SelectOption>>,
  "options" | "value" | "onChange" | "isMulti"
>;

type SelectFieldMultiProps = {
  isMulti: true;
  options: SelectOption[];
  value: readonly SelectOption[];
  onChange: (value: readonly SelectOption[]) => void;
} & Omit<
  SelectProps<SelectOption, true, GroupBase<SelectOption>>,
  "options" | "value" | "onChange" | "isMulti"
>;

export type SelectFieldProps = SelectFieldSingleProps | SelectFieldMultiProps;

type MultiSelectRef = ComponentRef<typeof Select<SelectOption, true>>;
type SingleSelectRef = ComponentRef<typeof Select<SelectOption, false>>;

/** Maps react-select’s default blues to Samyoga tokens (see defaultTheme.colors.primary = #2684FF). */
function samyogaSelectTheme(theme: Theme): Theme {
  return {
    ...theme,
    borderRadius: 12,
    spacing: {
      ...theme.spacing,
      baseUnit: 4,
      controlHeight: 44,
    },
    colors: {
      ...theme.colors,
      primary: "var(--primary)",
      primary75: "color-mix(in srgb, var(--primary) 72%, var(--background) 28%)",
      primary50: "color-mix(in srgb, var(--primary) 42%, var(--background) 58%)",
      primary25: "color-mix(in srgb, var(--primary) 16%, var(--background) 84%)",
      danger: "var(--danger)",
      dangerLight: "color-mix(in srgb, var(--danger) 24%, var(--background) 76%)",
    },
  };
}

function useSelectStyles<
  IsMulti extends boolean,
>(): StylesConfig<SelectOption, IsMulti, GroupBase<SelectOption>> {
  return useMemo(
    () => ({
      container: (base) => ({
        ...base,
        fontFamily: "inherit",
      }),
      control: (base, state) => ({
        ...base,
        minHeight: 44,
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        borderRadius: "0.75rem",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: state.isFocused
          ? "color-mix(in srgb, var(--primary) 45%, var(--border))"
          : "color-mix(in srgb, var(--border) 92%, transparent)",
        backgroundColor: "var(--card)",
        boxShadow: state.isFocused
          ? "inset 0 1px 2px var(--bezel-shadow), 0 0 0 3px color-mix(in srgb, var(--primary) 22%, transparent)"
          : "inset 0 1px 2px var(--bezel-shadow)",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
        "&:hover": {
          borderColor: state.isDisabled
            ? "color-mix(in srgb, var(--border) 92%, transparent)"
            : "color-mix(in srgb, var(--primary) 35%, var(--border))",
        },
      }),
      valueContainer: (base) => ({
        ...base,
        paddingLeft: 14,
        paddingRight: 6,
        paddingTop: 6,
        paddingBottom: 6,
      }),
      indicatorsContainer: (base) => ({
        ...base,
        color: "var(--muted)",
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        paddingLeft: 4,
        paddingRight: 12,
        color: "var(--muted)",
        cursor: state.isDisabled ? "not-allowed" : "pointer",
        ":hover": { color: "var(--foreground)" },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "var(--muted)",
        cursor: "pointer",
        ":hover": { color: "var(--danger)" },
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "0.75rem",
        border: "1px solid color-mix(in srgb, var(--border) 88%, transparent)",
        backgroundColor: "var(--card)",
        boxShadow:
          "0 10px 38px -12px color-mix(in srgb, var(--foreground) 18%, transparent), 0 0 0 1px color-mix(in srgb, var(--border) 40%, transparent)",
        zIndex: 300,
        marginTop: 6,
        marginBottom: 6,
        overflow: "visible",
      }),
      menuPortal: (base) => ({ ...base, zIndex: "var(--z-index-select-menu)" }),
      menuList: (base) => ({
        ...base,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 4,
        paddingRight: 4,
        maxHeight: "min(40vh, 280px)",
        overflowX: "hidden",
        overflowY: "auto",
      }),
      option: (base, state) => {
        if (state.isDisabled) {
          return {
            ...base,
            fontSize: "0.875rem",
            cursor: "not-allowed",
            color: "var(--muted)",
            opacity: 0.72,
            margin: 0,
            padding: "7px 10px",
            borderRadius: "0.5rem",
            backgroundColor: state.isFocused
              ? "color-mix(in srgb, var(--foreground) 5%, transparent)"
              : "transparent",
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          };
        }
        const { isSelected, isFocused } = state;
        let backgroundColor = "transparent";
        if (isSelected && isFocused) {
          backgroundColor = "color-mix(in srgb, var(--foreground) 11%, transparent)";
        } else if (isSelected) {
          backgroundColor = "color-mix(in srgb, var(--foreground) 7%, transparent)";
        } else if (isFocused) {
          backgroundColor = "color-mix(in srgb, var(--foreground) 6%, transparent)";
        }
        return {
          ...base,
          fontSize: "0.875rem",
          lineHeight: 1.3,
          cursor: "pointer",
          color: "var(--foreground)",
          margin: 0,
          padding: "7px 10px",
          minHeight: 34,
          display: "block",
          borderRadius: "0.5rem",
          backgroundColor,
          fontWeight: isSelected ? 500 : 400,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          boxShadow: "none",
        };
      },
      multiValue: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        backgroundColor: "color-mix(in srgb, var(--primary) 14%, transparent)",
        border: "1px solid color-mix(in srgb, var(--primary) 28%, transparent)",
      }),
      multiValueLabel: (base) => ({ ...base, color: "var(--foreground)", fontSize: "0.75rem" }),
      multiValueRemove: (base) => ({
        ...base,
        color: "var(--muted)",
        ":hover": { backgroundColor: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" },
      }),
      singleValue: (base) => ({ ...base, color: "var(--foreground)" }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
        color: "var(--foreground)",
        caretColor: "var(--primary)",
        outline: "none",
      }),
      placeholder: (base) => ({ ...base, color: "var(--muted)" }),
      loadingIndicator: (base) => ({ ...base, color: "var(--primary)" }),
      loadingMessage: (base) => ({
        ...base,
        fontSize: "0.875rem",
        color: "var(--muted)",
        padding: "10px 12px",
      }),
      noOptionsMessage: (base) => ({
        ...base,
        fontSize: "0.875rem",
        color: "var(--muted)",
        padding: "10px 12px",
      }),
      groupHeading: (base) => ({
        ...base,
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--muted)",
        padding: "8px 12px 4px",
      }),
    }),
    [],
  );
}

const selectClassNames = {
  container: () => "text-sm",
  menuList: () => "scroll-themed-y",
  control: (state: { isDisabled: boolean }) => (state.isDisabled ? "opacity-[0.92]" : ""),
} as const;

function mergeClassNames<Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  user: SelectProps<Option, IsMulti, Group>["classNames"],
): NonNullable<SelectProps<Option, IsMulti, Group>["classNames"]> {
  return {
    ...user,
    container: (p) => [selectClassNames.container(), user?.container?.(p)].filter(Boolean).join(" "),
    menuList: (p) => [selectClassNames.menuList(), user?.menuList?.(p)].filter(Boolean).join(" "),
    control: (p) => [selectClassNames.control(p), user?.control?.(p)].filter(Boolean).join(" "),
  };
}

export const SelectField = forwardRef<MultiSelectRef | SingleSelectRef, SelectFieldProps>(function SelectField(
  props,
  ref,
) {
  const autoInstanceId = useId().replace(/:/g, "");
  const stylesMulti = useSelectStyles<true>();
  const stylesSingle = useSelectStyles<false>();

  if (props.isMulti) {
    const {
      options,
      value,
      onChange,
      className = "",
      isMulti,
      isSearchable,
      instanceId = `select-m-${autoInstanceId}`,
      classNames: userClassNames,
      styles: userStyles,
      theme: userTheme,
      menuPortalTarget: _ignoredMenuPortal,
      menuPosition: _ignoredMenuPosition,
      ...rest
    } = props;
    void isMulti;
    void _ignoredMenuPortal;
    void _ignoredMenuPosition;
    const styles = userStyles ? mergeStyles(stylesMulti, userStyles) : stylesMulti;
    return (
      <Select<SelectOption, true>
        ref={ref as Ref<MultiSelectRef>}
        instanceId={instanceId}
        theme={userTheme ?? samyogaSelectTheme}
        styles={styles}
        options={options}
        value={[...value]}
        isMulti
        isSearchable={isSearchable ?? true}
        onChange={(v: MultiValue<SelectOption>) => onChange(v ?? [])}
        className={className}
        classNames={mergeClassNames(userClassNames)}
        {...rest}
        menuPortalTarget={typeof document !== "undefined" ? document.body : null}
        menuPosition="fixed"
      />
    );
  }

  const {
    options,
    value,
    onChange,
    className = "",
    isMulti,
    isSearchable,
    instanceId = `select-s-${autoInstanceId}`,
    classNames: userClassNames,
    styles: userStyles,
    theme: userTheme,
    menuPortalTarget: _ignoredMenuPortalS,
    menuPosition: _ignoredMenuPositionS,
    ...rest
  } = props;
  void isMulti;
  void _ignoredMenuPortalS;
  void _ignoredMenuPositionS;
  const styles = userStyles ? mergeStyles(stylesSingle, userStyles) : stylesSingle;
  return (
    <Select<SelectOption, false>
      ref={ref as Ref<SingleSelectRef>}
      instanceId={instanceId}
      theme={userTheme ?? samyogaSelectTheme}
      styles={styles}
      options={options}
      value={value}
      isSearchable={isSearchable ?? true}
      onChange={(v: SingleValue<SelectOption>) => onChange(v)}
      className={className}
      classNames={mergeClassNames(userClassNames)}
      {...rest}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
    />
  );
});

SelectField.displayName = "SelectField";
