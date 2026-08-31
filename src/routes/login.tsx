import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthCard } from "../components/forms/auth-card";
import { useToast } from "../components/ui/toast";
import { LoginForm } from "../features/auth/components/login-form";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    activation: search.activation === "success" || search.activation === "invalid" ? search.activation : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { activation } = Route.useSearch();
  const { toast } = useToast();

  useEffect(() => {
    if (activation === "success") {
      toast({ title: "Account activated", description: "You can now sign in to Mailcloud.", variant: "success" });
    } else if (activation === "invalid") {
      toast({ title: "Activation link invalid", description: "The link may have expired or already been used.", variant: "error" });
    }
  }, [activation, toast]);

  return (
    <AuthCard title="Welcome back" description="Sign in to your email workspace" footerHref="/register" footerText="Create an account">
      <LoginForm />
    </AuthCard>
  );
}
