import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { ControlledField } from "../../../components/forms/controlled-field";
import { FormField, getFieldError, invalidFieldClass } from "../../../components/forms/form-field";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { useToast } from "../../../components/ui/toast";
import { sendEmail } from "../services";
import { useMailConfiguration } from "../hooks/use-mail-configuration";
import { messageSchema, recipientSchema, sendEmailSchema, subjectSchema, type SendEmailInput } from "../validation";

function SendEmailForm() {
  const { toast } = useToast();
  const { accounts, loading: sendersLoading, error: sendersError } = useMailConfiguration();
  const senders = accounts.flatMap((account) => account.senders);
  const form = useForm({
    defaultValues: { senderId: "", to: "", subject: "", text: "" } as SendEmailInput,
    validators: { onSubmit: sendEmailSchema },
    onSubmit: async ({ value }) => {
      try {
        await sendEmail(value);
        toast({ title: "Email berhasil dikirim", variant: "success" });
        form.reset();
      } catch (error) {
        const description = error instanceof Error ? error.message : "Gagal mengirim email";
        toast({ title: "Pengiriman gagal", description, variant: "error" });
      }
    },
  });

  return (
    <form className="grid gap-5" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void form.handleSubmit(); }}>
      <form.Field name="senderId" validators={{ onChange: ({ value }) => value ? undefined : "Pilih email sender terlebih dahulu" }}>
        {(field) => {
          const error = getFieldError(field.state.meta.errors);
          return <FormField label="From sender" htmlFor={field.name} error={error}>
            <select id={field.name} name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} onBlur={field.handleBlur} aria-invalid={Boolean(error)} className={`h-10 w-full rounded-md border bg-background px-3 pr-10 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${error ? "border-destructive focus-visible:ring-destructive" : "border-input"}`} disabled={sendersLoading}>
              <option value="">{sendersLoading ? "Loading senders..." : "Choose a sender"}</option>
              {senders.map((sender) => <option key={sender.id} value={sender.id}>{sender.name} &lt;{sender.fromEmail}&gt;</option>)}
            </select>
          </FormField>;
        }}
      </form.Field>
      {!sendersLoading && !sendersError && senders.length === 0 && <p className="text-sm text-muted-foreground">No sender is configured yet. <Link className="font-semibold text-foreground underline" to="/dashboard/senders">Set up a sender first.</Link></p>}
      {sendersError && <p className="text-sm text-destructive" role="alert">{sendersError}</p>}
      <form.Field name="to" validators={{ onChange: recipientSchema }}>
        {(field) => <ControlledField field={field} label="Recipient" type="email" placeholder="customer@example.com" />}
      </form.Field>
      <form.Field name="subject" validators={{ onChange: subjectSchema }}>
        {(field) => <ControlledField field={field} label="Subject" placeholder="A short subject" />}
      </form.Field>
      <form.Field name="text" validators={{ onChange: messageSchema }}>
        {(field) => {
          const error = getFieldError(field.state.meta.errors);
          return <FormField label="Message" htmlFor={field.name} error={error}><Textarea id={field.name} name={field.name} rows={9} placeholder="Write your message..." value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} onBlur={field.handleBlur} aria-invalid={Boolean(error)} className={invalidFieldClass(error)} /></FormField>;
        }}
      </form.Field>
      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send email"}</Button>}
      </form.Subscribe>
    </form>
  );
}

export { SendEmailForm };
