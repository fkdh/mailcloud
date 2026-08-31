import { createFileRoute } from "@tanstack/react-router";
import { handleApiSendEmail } from "../../../../server/services/email";

export const Route = createFileRoute("/api/v1/emails/send")({
  server: { handlers: { POST: ({ request }) => handleApiSendEmail(request) } },
});
