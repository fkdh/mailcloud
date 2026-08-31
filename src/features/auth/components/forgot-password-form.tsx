import { useForm } from "@tanstack/react-form";
import { ControlledField } from "../../../components/forms/controlled-field";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import { requestPasswordReset } from "../services";
import { authEmailSchema, forgotPasswordSchema, type ForgotPasswordInput } from "../validation";

function ForgotPasswordForm() {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: { email: "" } as ForgotPasswordInput,
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await requestPasswordReset(value);
        toast({
          title: "Password reset email sent",
          description: `If the account is active, a password reset link has been sent to ${value.email}.`,
          variant: "success",
          duration: null,
        });
        form.reset();
      } catch (error) {
        const description = error instanceof Error ? error.message : "Password reset request failed";
        toast({ title: "Request failed", description, variant: "error" });
      }
    },
  });

  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit(); }}>
      <form.Field name="email" validators={{ onChange: authEmailSchema }}>
        {(field) => <ControlledField field={field} label="Email" type="email" placeholder="you@example.com" />}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send reset link"}</Button>}
      </form.Subscribe>
    </form>
  );
}

export { ForgotPasswordForm };
