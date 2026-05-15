/** Shape we read from Better Auth session / `GET /me/profile` for internal portal gating. */
export type SessionUserLike = {
  id?: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  superAdmin?: boolean;
};

export function isSuperAdminUser(user: SessionUserLike | null | undefined): boolean {
  return user?.superAdmin === true;
}
