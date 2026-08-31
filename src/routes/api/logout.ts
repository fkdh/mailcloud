import { createFileRoute } from "@tanstack/react-router";
import { handleLogout } from "../../server/services/session";

export const Route = createFileRoute("/api/logout")({
  server: { handlers: { POST: ({ request }) => handleLogout(request) } },
});
