import { createFileRoute } from "@tanstack/react-router";
import { handleUserDelete, handleUserStatusUpdate } from "../../../server/services/users";

export const Route = createFileRoute("/api/admin/users/$id")({
  server: {
    handlers: {
      PATCH: ({ request, params }) => handleUserStatusUpdate(request, params.id),
      DELETE: ({ request, params }) => handleUserDelete(request, params.id),
    },
  },
});
