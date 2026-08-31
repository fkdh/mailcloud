import { createFileRoute } from "@tanstack/react-router";
import { handleRegister } from "../../server/services/auth";

export const Route = createFileRoute("/api/register")({
  server: { handlers: { POST: ({ request }) => handleRegister(request) } },
});
