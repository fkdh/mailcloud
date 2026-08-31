import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "../components/forms/auth-card";
import { LoginForm } from "../features/auth/components/login-form";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to your email workspace" footerHref="/register" footerText="Create an account">
      <LoginForm />
    </AuthCard>
  );
}
