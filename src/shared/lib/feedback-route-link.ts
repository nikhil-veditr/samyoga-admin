const PATIENT_CHART_PATH = /^\/patient-records\/([^/?#]+)(?:\/|$|[?#])/;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getHmsAppUrl(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_HMS_APP_URL?.trim();
  return raw ? raw.replace(/\/+$/, "") : undefined;
}

export function isInternalFeedbackRoute(route: string): boolean {
  const trimmed = route.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return false;
  return true;
}

export function parsePatientIdFromFeedbackRoute(route: string): string | null {
  const pathOnly = route.split("?")[0]?.split("#")[0] ?? route;
  const match = pathOnly.trim().match(PATIENT_CHART_PATH);
  const segment = match?.[1]?.trim();
  if (!segment || !UUID_RE.test(segment)) return null;
  return segment;
}

export function feedbackRouteLabel(route: string): string {
  if (parsePatientIdFromFeedbackRoute(route)) return "Patient chart";
  const path = route.split("?")[0] ?? route;
  if (path.startsWith("/lab/reports")) return "Lab reports";
  if (path.startsWith("/lab")) return "Lab";
  if (path.startsWith("/clinical-documents")) return "Clinical documents";
  if (path.startsWith("/appointments")) return "Appointments";
  if (path.startsWith("/patient-records")) return "Patient records";
  return "Open page";
}

export function buildHmsFeedbackLink(route: string): string | null {
  const base = getHmsAppUrl();
  if (!base || !isInternalFeedbackRoute(route)) return null;
  const trimmed = route.trim();
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}
