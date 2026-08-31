import { createFileRoute } from "@tanstack/react-router";
import { handleActivateAccount } from "../../server/services/account-activation";

export const Route = createFileRoute("/api/activate")({
  server: { handlers: { GET: ({ request }) => handleActivateAccount(request) } },
});
