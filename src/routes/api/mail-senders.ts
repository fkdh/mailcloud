import { createFileRoute } from "@tanstack/react-router";
import { handleCreateMailSender, handleMailConfiguration } from "../../server/services/mail-senders";

export const Route = createFileRoute("/api/mail-senders")({
  server: {
    handlers: {
      GET: ({ request }) => handleMailConfiguration(request),
      POST: ({ request }) => handleCreateMailSender(request),
    },
  },
});
