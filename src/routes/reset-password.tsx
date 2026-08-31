import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthCard } from "../components/forms/auth-card";
import { ResetPasswordForm } from "../features/auth/components/reset-password-form";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();

  return (
    <AuthCard title="Choose a new password" description="Use a password you do not reuse elsewhere." footerHref="/login" footerText="Back to sign in">
      {token ? <ResetPasswordForm token={token} /> : <div className="space-y-4 text-center text-sm text-muted-foreground"><p>This reset link is missing or invalid.</p><Link className="font-medium text-primary hover:underline" to="/forgot-password">Request a new link</Link></div>}
    </AuthCard>
  );
}
