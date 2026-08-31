export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  createdAt: string;
  tenant: { id: string; name: string } | null;
};
