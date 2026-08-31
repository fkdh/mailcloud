import { createFileRoute } from "@tanstack/react-router";
import { handleEmailLogs } from "../../server/services/email";

export const Route = createFileRoute("/api/email-logs")({
  server: { handlers: { GET: ({ request }) => handleEmailLogs(request) } },
});
