import { formatDistanceToNow } from "date-fns";
import { enIN, type Locale } from "date-fns/locale";

const ADMIN_LOCALE = "en-IN";
const ADMIN_TIMEZONE = "Asia/Kolkata";

function parseInstant(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function safeFormat(formatter: Intl.DateTimeFormat, value: string | Date, fallback: string): string {
  try {
    return formatter.format(parseInstant(value));
  } catch {
    return typeof value === "string" ? value : fallback;
  }
}

function resolveDateFnsLocale(locale: string): Locale {
  if (locale.startsWith("en-IN")) return enIN;
  return enIN;
}

export type AdminFormatters = {
  formatDate: (value: string | Date) => string;
  formatDateTime: (value: string | Date) => string;
  formatRelative: (value: string | Date) => string;
};

export function createAdminFormatters(): AdminFormatters {
  const dateFormatter = new Intl.DateTimeFormat(ADMIN_LOCALE, {
    timeZone: ADMIN_TIMEZONE,
    dateStyle: "medium",
  });
  const dateTimeFormatter = new Intl.DateTimeFormat(ADMIN_LOCALE, {
    timeZone: ADMIN_TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  });
  const dateFnsLocale = resolveDateFnsLocale(ADMIN_LOCALE);

  return {
    formatDate: (value) => safeFormat(dateFormatter, value, String(value)),
    formatDateTime: (value) => safeFormat(dateTimeFormatter, value, String(value)),
    formatRelative: (value) => {
      try {
        return formatDistanceToNow(parseInstant(value), { addSuffix: true, locale: dateFnsLocale });
      } catch {
        return String(value);
      }
    },
  };
}
