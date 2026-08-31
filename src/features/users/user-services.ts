import { apiRequest } from "../../lib/api";
import type { UserRecord } from "./user-types";

export function getUsers() {
  return apiRequest<{ users: UserRecord[] }>("/api/admin/users");
}

export function updateUserStatus(id: string, status: UserRecord["status"]) {
  return apiRequest<{ message: string }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function deleteUser(id: string) {
  return apiRequest<{ message: string }>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}
