import { toast } from "sonner";
import { TENANT_ID_HEADER } from "@/shared/constants/http-headers";
import { getPublicRestApiBaseUrl } from "@/shared/lib/api/public-rest-base-url";

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;

type ApiEnvelope<T> = {
  status: "success" | "error" | "warn";
  code: string;
  message: string;
  statusCode: number;
  traceId: string;
  timestamp: string;
  data: T | null;
  details?: unknown;
};

type FetchClientOptions<TBody> = {
  /** Path after the API version, e.g. `/internal/tenants` — not including `api/v1`. */
  endpoint: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  /** When true, no success toasts (use for polling / profile reads). Errors still toast. */
  silent?: boolean;
  /**
   * Internal portal is not tenant-scoped by default. Pass a tenant UUID when calling
   * tenant-context endpoints that require `x-tenant-id`.
   */
  tenantId?: string | null;
};

const normalizeEndpoint = (endpoint: string): string => {
  const trimmed = endpoint.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed;
};

const buildQueryString = (query?: Record<string, QueryValue>): string => {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const fetchClient = async <TResponse, TBody = unknown>({
  endpoint,
  method = "GET",
  body,
  query,
  headers,
  silent = false,
  tenantId = null,
}: FetchClientOptions<TBody>): Promise<TResponse> => {
  const base = getPublicRestApiBaseUrl();
  const url = `${base}${normalizeEndpoint(endpoint)}${buildQueryString(query)}`;
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(tenantId ? { [TENANT_ID_HEADER]: tenantId } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let parsed: ApiEnvelope<TResponse> | null = null;

  try {
    parsed = (await response.json()) as ApiEnvelope<TResponse>;
  } catch {
    parsed = null;
  }

  if (!response.ok || !parsed || parsed.status !== "success") {
    const message = parsed?.message ?? "Request failed";
    toast.error(message);
    throw new Error(message);
  }

  if (!silent && parsed.message) {
    toast.success(parsed.message);
  }

  return parsed.data as TResponse;
};
