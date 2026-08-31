import { createFileRoute } from "@tanstack/react-router";
import { handleDashboardAnalytics } from "../../server/services/analytics";

export const Route = createFileRoute("/api/dashboard-analytics")({
  server: { handlers: { GET: ({ request }) => handleDashboardAnalytics(request) } },
});
