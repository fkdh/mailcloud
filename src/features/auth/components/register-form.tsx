import { useForm } from "@tanstack/react-form";
import { ControlledField } from "../../../components/forms/controlled-field";
import { Button } from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import { register } from "../services";
import { authEmailSchema, nameSchema, passwordSchema, registerSchema, tenantNameSchema, type RegisterInput } from "../validation";

function RegisterForm() {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: { name: "", tenantName: "", email: "", password: "", confirmPassword: "" } as RegisterInput,
    validators: { onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      try {
        await register(value);
        toast({
          title: "Account created",
          description: `An activation link has been sent to ${value.email}. Check your inbox to activate your account.`,
          variant: "success",
          duration: null,
        });
        form.reset();
      } catch (error) {
        const description = error instanceof Error ? error.message : "Registrasi gagal";
        toast({ title: "Registrasi gagal", description, variant: "error" });
      }
    },
  });

  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit(); }}>
      <form.Field name="name" validators={{ onChange: nameSchema }}>
        {(field) => <ControlledField field={field} label="Your name" />}
      </form.Field>
      <form.Field name="tenantName" validators={{ onChange: tenantNameSchema }}>
        {(field) => <ControlledField field={field} label="Business name" />}
      </form.Field>
      <form.Field name="email" validators={{ onChange: authEmailSchema }}>
        {(field) => <ControlledField field={field} label="Email" type="email" />}
      </form.Field>
      <form.Field name="password" validators={{ onChange: passwordSchema }}>
        {(field) => <ControlledField field={field} label="Password" type="password" />}
      </form.Field>
      <form.Field name="confirmPassword" validators={{
        onChangeListenTo: ["password"],
        onChange: ({ value, fieldApi }) => {
          const result = passwordSchema.safeParse(value);
          if (!result.success) return result.error.issues[0]?.message;
          return value === fieldApi.form.getFieldValue("password") ? undefined : "Password dan repeat password harus sama";
        },
      }}>
        {(field) => <ControlledField field={field} label="Repeat password" type="password" />}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Registering..." : "Register"}</Button>}
      </form.Subscribe>
    </form>
  );
}

export { RegisterForm };
