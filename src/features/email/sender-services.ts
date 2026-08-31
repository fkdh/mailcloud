import { apiRequest } from "../../lib/api";
import type { GmailAccountInput, MailSenderInput } from "./sender-validation";
import type { MailConfiguration } from "./sender-types";

export function getMailConfiguration() {
  return apiRequest<MailConfiguration>("/api/mail-senders");
}

export function createGmailAccount(input: GmailAccountInput) {
  return apiRequest<{ message: string }>("/api/gmail-accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function createMailSender(input: MailSenderInput) {
  return apiRequest<{ message: string }>("/api/mail-senders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteGmailAccount(id: string) {
  return apiRequest<{ message: string }>(`/api/gmail-accounts/${id}`, { method: "DELETE" });
}

export function updateMailSender(id: string, input: { isDefault?: boolean; status?: "ACTIVE" | "DISABLED" }) {
  return apiRequest<{ message: string }>(`/api/mail-senders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deleteMailSender(id: string) {
  return apiRequest<{ message: string }>(`/api/mail-senders/${id}`, { method: "DELETE" });
}
