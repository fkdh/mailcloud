import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { ControlledField } from "../../../components/forms/controlled-field";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import { login } from "../services";
import { authEmailSchema, loginPasswordSchema, loginSchema, type LoginInput } from "../validation";

function LoginForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: { email: "", password: "" } as LoginInput,
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        await login(value);
        toast({ title: "Login berhasil", variant: "success" });
        await navigate({ to: "/dashboard" });
      } catch (error) {
        const description = error instanceof Error ? error.message : "Login gagal";
        toast({ title: "Login gagal", description, variant: "error" });
      }
    },
  });

  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit(); }}>
      <form.Field name="email" validators={{ onChange: authEmailSchema }}>
        {(field) => <ControlledField field={field} label="Email" type="email" />}
      </form.Field>
      <form.Field name="password" validators={{ onChange: loginPasswordSchema }}>
        {(field) => <ControlledField field={field} label="Password" type="password" />}
      </form.Field>
      <div className="grid gap-3">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign in"}</Button>}
        </form.Subscribe>
        <Link className="text-center text-sm text-primary hover:underline" to="/forgot-password">Forgot password?</Link>
      </div>
    </form>
  );
}

export { LoginForm };
