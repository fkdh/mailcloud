import { createFileRoute } from "@tanstack/react-router";
import { handleSendEmail } from "../../server/services/email";

export const Route = createFileRoute("/api/send-email")({
  server: { handlers: { POST: ({ request }) => handleSendEmail(request) } },
});
