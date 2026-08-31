import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardShell } from "../components/layout/dashboard-shell";
import { getAuthenticationState } from "../features/auth/server-functions";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { authenticated } = await getAuthenticationState();
    if (!authenticated) throw redirect({ to: "/login" });
  },
  component: DashboardShell,
});
