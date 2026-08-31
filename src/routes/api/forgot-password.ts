import { createFileRoute } from "@tanstack/react-router";
import { handleForgotPassword } from "../../server/services/password-reset";

export const Route = createFileRoute("/api/forgot-password")({
  server: { handlers: { POST: ({ request }) => handleForgotPassword(request) } },
});
