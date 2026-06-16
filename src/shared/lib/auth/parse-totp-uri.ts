/** Parsed fields from a standard `otpauth://totp/...` URI (Better Auth / TOTP apps). */
export type ParsedTotpUri = {
  secret: string;
  issuer: string;
  account: string;
};

function decodeOtpauthSegment(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

/**
 * Extracts manual-entry fields from an otpauth TOTP URI for authenticator apps.
 * Returns null when the URI is missing a secret or is not a TOTP link.
 */
export function parseTotpUri(uri: string): ParsedTotpUri | null {
  try {
    const url = new URL(uri);
    if (url.protocol !== "otpauth:" || url.hostname !== "totp") {
      return null;
    }

    const secret = url.searchParams.get("secret")?.trim();
    if (!secret) return null;

    const label = decodeOtpauthSegment(url.pathname.replace(/^\//, ""));
    const issuerParam = url.searchParams.get("issuer");
    const issuer = issuerParam
      ? decodeOtpauthSegment(issuerParam)
      : label.includes(":")
        ? decodeOtpauthSegment(label.split(":")[0] ?? "")
        : "Samyoga Admin";

    const account = label.includes(":")
      ? decodeOtpauthSegment(label.split(":").slice(1).join(":"))
      : label;

    return { secret, issuer, account };
  } catch {
    return null;
  }
}
