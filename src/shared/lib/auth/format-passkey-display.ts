import type { PasskeyRow } from "@/components/organisms/profile/profile-passkeys.shared";

export const SUGGESTED_SECURITY_KEY_LABEL = "Security key";

const HARDWARE_TRANSPORTS = new Set(["usb", "nfc", "ble"]);

function parseTransports(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/** True when WebAuthn transports indicate a USB/NFC/BLE security key. */
export function isSecurityKeyPasskey(passkey: Pick<PasskeyRow, "transports" | "deviceType">): boolean {
  const transports = parseTransports(passkey.transports ?? null);
  if (transports.some((t) => HARDWARE_TRANSPORTS.has(t))) return true;
  return passkey.deviceType?.toLowerCase() === "singledevice" && !transports.includes("internal");
}

/** Secondary line under the passkey name in Profile. */
export function formatPasskeyKindLabel(passkey: Pick<PasskeyRow, "deviceType" | "transports">): string {
  if (isSecurityKeyPasskey(passkey)) return "Security key · works on any computer";
  if (passkey.deviceType?.toLowerCase() === "multidevice") return "Passkey · synced across devices";
  return "Passkey · this device";
}
