import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "../components/forms/auth-card";
import { RegisterForm } from "../features/auth/components/register-form";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  return (
    <AuthCard title="Create workspace" description="Register as an admin and wait for approval" footerHref="/login" footerText="Back to sign in">
      <RegisterForm />
    </AuthCard>
  );
}
