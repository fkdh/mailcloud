import { createFileRoute } from "@tanstack/react-router";
import { handleMe } from "../../server/services/session";

export const Route = createFileRoute("/api/me")({
  server: { handlers: { GET: ({ request }) => handleMe(request) } },
});
