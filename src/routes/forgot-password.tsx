import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "../components/forms/auth-card";
import { ForgotPasswordForm } from "../features/auth/components/forgot-password-form";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset your password" description="Enter your email and we will send you a secure reset link." footerHref="/login" footerText="Back to sign in">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
