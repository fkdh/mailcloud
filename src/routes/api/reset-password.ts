import { createFileRoute } from "@tanstack/react-router";
import { handleResetPassword } from "../../server/services/password-reset";

export const Route = createFileRoute("/api/reset-password")({
  server: { handlers: { POST: ({ request }) => handleResetPassword(request) } },
});
