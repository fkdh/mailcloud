import { createFileRoute } from "@tanstack/react-router";
import { handleGmailAccountDelete } from "../../../server/services/mail-senders";

export const Route = createFileRoute("/api/gmail-accounts/$id")({
  server: { handlers: { DELETE: ({ request, params }) => handleGmailAccountDelete(request, params.id) } },
});
