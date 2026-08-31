import { createFileRoute } from "@tanstack/react-router";
import { handleApiTokenDelete } from "../../../server/services/api-tokens";

export const Route = createFileRoute("/api/api-tokens/$id")({
  server: { handlers: { DELETE: ({ request, params }) => handleApiTokenDelete(request, params.id) } },
});
