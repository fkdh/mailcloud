import { createFileRoute } from "@tanstack/react-router";
import { handleLogin } from "../../server/services/auth";

export const Route = createFileRoute("/api/login")({
  server: { handlers: { POST: ({ request }) => handleLogin(request) } },
});
