import { apiRequest } from "../../lib/api";
import type { DashboardAnalytics } from "./types";

export function getDashboardAnalytics() {
  return apiRequest<DashboardAnalytics>("/api/dashboard-analytics");
}
