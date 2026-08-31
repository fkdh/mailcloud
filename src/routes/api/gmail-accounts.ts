import { createFileRoute } from "@tanstack/react-router";
import { handleCreateGmailAccount } from "../../server/services/mail-senders";

export const Route = createFileRoute("/api/gmail-accounts")({
  server: { handlers: { POST: ({ request }) => handleCreateGmailAccount(request) } },
});
