/** Two-letter initials for avatar / compact UI. */
export function getUserInitials(first?: string, last?: string, email?: string): string {
  const a = first?.trim().charAt(0);
  const b = last?.trim().charAt(0);
  if (a && b) return `${a}${b}`.toUpperCase();
  if (a) return a.toUpperCase();
  const local = email?.split("@")[0]?.slice(0, 2);
  if (local) return local.toUpperCase();
  return "?";
}
