import { createFileRoute } from "@tanstack/react-router";
import { handleMailSenderDelete, handleMailSenderUpdate } from "../../../server/services/mail-senders";

export const Route = createFileRoute("/api/mail-senders/$id")({
  server: {
    handlers: {
      PATCH: ({ request, params }) => handleMailSenderUpdate(request, params.id),
      DELETE: ({ request, params }) => handleMailSenderDelete(request, params.id),
    },
  },
});
