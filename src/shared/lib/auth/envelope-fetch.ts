/**
 * Samyoga BE wraps many JSON responses (including Better Auth routes) in `{ status, data, ... }`.
 * The Better Auth client expects unwrapped Better Auth shapes — normalize via this fetch wrapper.
 *
 * Reads JSON via ArrayBuffer + UTF-8 decode (no `res.text()` Content-Encoding edge cases).
 * Synthetic responses use clean headers only (no inherited `Content-Encoding`).
 */

function clampHttpStatus(status: number): number {
  if (!Number.isFinite(status) || status < 200 || status > 599) {
    return 500;
  }
  return status;
}

/** Sliding session refresh sends new `Set-Cookie` on `get-session`; preserve them on synthetic bodies. */
function forwardSetCookies(target: Headers, source: Headers): void {
  const list = typeof source.getSetCookie === "function" ? source.getSetCookie() : [];
  for (const cookie of list) {
    target.append("Set-Cookie", cookie);
  }
}

function jsonResponse(body: string, status: number, sourceHeaders?: Headers): Response {
  const headers = new Headers();
  headers.set("content-type", "application/json; charset=utf-8");
  if (sourceHeaders) forwardSetCookies(headers, sourceHeaders);
  return new Response(body, { status: clampHttpStatus(status), headers });
}

export async function betterAuthEnvelopeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Network request failed";
    return jsonResponse(JSON.stringify({ message }), 503);
  }

  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return res;
  }

  let buf: ArrayBuffer;
  try {
    buf = await res.arrayBuffer();
  } catch {
    return jsonResponse(JSON.stringify({ message: "Could not read auth response body" }), clampHttpStatus(res.status), res.headers);
  }

  const text = new TextDecoder().decode(buf);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return jsonResponse(text, res.status, res.headers);
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "status" in parsed &&
    (parsed as { status: unknown }).status === "success" &&
    "data" in parsed
  ) {
    const data = (parsed as { data: unknown }).data;
    return jsonResponse(JSON.stringify(data ?? null), res.status, res.headers);
  }

  if (parsed && typeof parsed === "object" && "status" in parsed && (parsed as { status: unknown }).status === "error") {
    const err = parsed as { message?: string; statusCode?: number };
    const status = typeof err.statusCode === "number" ? err.statusCode : res.status;
    return jsonResponse(JSON.stringify({ message: err.message ?? "Request failed" }), status, res.headers);
  }

  return jsonResponse(JSON.stringify(parsed), res.status, res.headers);
}

export function unwrapSamyogaEnvelopeJson(parsed: unknown): unknown {
  if (
    parsed &&
    typeof parsed === "object" &&
    "status" in parsed &&
    (parsed as { status: unknown }).status === "success" &&
    "data" in parsed
  ) {
    return (parsed as { data: unknown }).data;
  }
  return parsed;
}
