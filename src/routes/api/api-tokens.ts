import { createFileRoute } from "@tanstack/react-router";
import { handleApiTokens } from "../../server/services/api-tokens";

export const Route = createFileRoute("/api/api-tokens")({
  server: {
    handlers: {
      GET: ({ request }) => handleApiTokens(request),
      POST: ({ request }) => handleApiTokens(request),
    },
  },
});
