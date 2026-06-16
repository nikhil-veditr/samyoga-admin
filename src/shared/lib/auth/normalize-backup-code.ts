/** Trim and strip common separators from pasted backup codes. */
export function normalizeBackupCodeInput(raw: string): string {
  return raw.trim().replace(/[\s-]+/g, "");
}
