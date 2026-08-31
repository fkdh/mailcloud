import { createFileRoute } from "@tanstack/react-router";
import { handleUserList } from "../../server/services/users";

export const Route = createFileRoute("/api/admin/users")({
  server: { handlers: { GET: ({ request }) => handleUserList(request) } },
});
