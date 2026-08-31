import { createFileRoute } from "@tanstack/react-router";
import { handleApprovalDecision, handleApprovalList } from "../../server/services/users";

export const Route = createFileRoute("/api/admin/approvals")({
  server: {
    handlers: {
      GET: ({ request }) => handleApprovalList(request),
      POST: ({ request }) => handleApprovalDecision(request),
    },
  },
});
