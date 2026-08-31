import { apiRequest } from "../../lib/api";
import type { AuthResponse, CurrentUserResponse } from "./types";
import type { LoginInput, RegisterInput } from "./validation";

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>("/api/login", jsonRequest("POST", input));
}

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>("/api/register", jsonRequest("POST", input));
}

export function logout() {
  return apiRequest<AuthResponse>("/api/logout", { method: "POST" });
}

export function getCurrentUser() {
  return apiRequest<CurrentUserResponse>("/api/me");
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
