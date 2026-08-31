export const dashboardNavigation = [
  { to: "/dashboard", label: "Overview", icon: "overview" },
  { to: "/dashboard/send-email", label: "Send email", icon: "send" },
  { to: "/dashboard/email-logs", label: "Email history", icon: "history" },
  { to: "/dashboard/senders", label: "Gmail settings", icon: "settings" },
  { to: "/dashboard/api-access", label: "API Access & Integrations", icon: "key" },
  { to: "/dashboard/approvals", label: "Approvals", icon: "approvals", role: "SUPERADMIN" },
  { to: "/dashboard/users", label: "All users", icon: "users", role: "SUPERADMIN" },
] as const;
