export type AdminUserProfile = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  superAdmin: boolean;
};
