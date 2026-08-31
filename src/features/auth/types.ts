export type UserRole = "SUPERADMIN" | "ADMIN";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  tenant: { id: string; name: string } | null;
};

export type CurrentUserResponse = { user: CurrentUser };
export type AuthResponse = { message: string };
