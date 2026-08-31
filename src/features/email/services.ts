import { apiRequest } from "../../lib/api";
import type { EmailLog, SendEmailInput } from "./types";

export function sendEmail(input: SendEmailInput) {
  return apiRequest<{ message: string; messageId?: string }>("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function getEmailLogs() {
  return apiRequest<{ logs: EmailLog[] }>("/api/email-logs");
}
