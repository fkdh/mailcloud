import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ControlledField } from "../../../components/forms/controlled-field";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import { resetPassword } from "../services";
import { passwordSchema, resetPasswordSchema, type ResetPasswordInput } from "../validation";

function ResetPasswordForm({ token }: { token: string }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: { token, password: "", confirmPassword: "" } as ResetPasswordInput,
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      try {
        await resetPassword(value);
        toast({ title: "Password updated", description: "Please sign in with your new password.", variant: "success" });
        await navigate({ to: "/login", search: { activation: undefined } });
      } catch (error) {
        const description = error instanceof Error ? error.message : "Password reset failed";
        toast({ title: "Password reset failed", description, variant: "error" });
      }
    },
  });

  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit(); }}>
      <form.Field name="password" validators={{ onChange: passwordSchema }}>
        {(field) => <ControlledField field={field} label="New password" type="password" />}
      </form.Field>
      <form.Field name="confirmPassword" validators={{
        onChangeListenTo: ["password"],
        onChange: ({ value, fieldApi }) => {
          const result = passwordSchema.safeParse(value);
          if (!result.success) return result.error.issues[0]?.message;
          return value === fieldApi.form.getFieldValue("password") ? undefined : "Passwords do not match";
        },
      }}>
        {(field) => <ControlledField field={field} label="Repeat password" type="password" />}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update password"}</Button>}
      </form.Subscribe>
    </form>
  );
}

export { ResetPasswordForm };
