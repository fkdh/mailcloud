import { useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ControlledField } from "../../../components/forms/controlled-field";
import { FormField, getFieldError } from "../../../components/forms/form-field";
import { Button } from "../../../components/ui/button";
import { buttonVariants } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { ConfirmationModal } from "../../../components/ui/confirmation-modal";
import { useCurrentUser } from "../../auth/hooks/use-current-user";
import { useToast } from "../../../components/ui/toast";
import { createGmailAccount, createMailSender, deleteGmailAccount, deleteMailSender, updateMailSender } from "../sender-services";
import { gmailAccountSchema, mailSenderSchema, type GmailAccountInput, type MailSenderInput } from "../sender-validation";
import { useMailConfiguration } from "../hooks/use-mail-configuration";

const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type DeleteTarget =
  | { type: "account"; id: string; name: string; senderCount: number }
  | { type: "sender"; id: string; name: string };

function MailSenderSetup() {
  const user = useCurrentUser();
  const { accounts, loading, error, reload } = useMailConfiguration();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("gmail");
    if (result === "connected") {
      toast({ title: "Gmail connected", description: "Your Google account is ready to send email.", variant: "success" });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (result === "error") {
      toast({ title: "Gmail connection failed", description: params.get("message") || "Please try again.", variant: "error" });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  const accountForm = useForm({
    defaultValues: { tenantId: "", label: "", smtpUser: "", appPassword: "" } as GmailAccountInput,
    validators: { onSubmit: gmailAccountSchema },
    onSubmit: async ({ value }) => {
      try {
        await createGmailAccount({ ...value, label: value.label.trim() || value.smtpUser });
        toast({ title: "Gmail account berhasil ditambahkan", description: "Sender bawaan dari alamat Gmail sudah dibuat. Tambahkan alias Send mail as jika diperlukan.", variant: "success" });
        accountForm.reset();
        await reload();
      } catch (requestError) {
        toast({ title: "Gmail account gagal ditambahkan", description: requestError instanceof Error ? requestError.message : "Request gagal", variant: "error" });
      }
    },
  });

  const senderForm = useForm({
    defaultValues: { gmailAccountId: "", name: "", fromEmail: "", isDefault: false } as MailSenderInput,
    validators: { onSubmit: mailSenderSchema },
    onSubmit: async ({ value }) => {
      try {
        await createMailSender(value);
        toast({ title: "Email sender berhasil ditambahkan", description: "Pastikan alamat tersebut sudah diverifikasi di Gmail Send mail as.", variant: "success" });
        senderForm.reset();
        await reload();
      } catch (requestError) {
        toast({ title: "Email sender gagal ditambahkan", description: requestError instanceof Error ? requestError.message : "Request gagal", variant: "error" });
      }
    },
  });

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "account") {
        await deleteGmailAccount(deleteTarget.id);
        toast({ title: "Gmail account dihapus", description: "Semua sender terkait ikut dihapus.", variant: "success" });
      } else {
        await deleteMailSender(deleteTarget.id);
        toast({ title: "Email sender dihapus", variant: "success" });
      }
      setDeleteTarget(null);
      await reload();
    } catch (requestError) {
      toast({ title: "Penghapusan gagal", description: requestError instanceof Error ? requestError.message : "Request gagal", variant: "error" });
    }
  }

  return <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle>Configure Gmail accounts</CardTitle><CardDescription>Add and manage the Gmail account used to authenticate SMTP for this workspace. The App Password is encrypted and never shown again.</CardDescription></CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-secondary/40 p-4">
          <div>
            <p className="font-semibold text-foreground">Connect with Google</p>
            <p className="mt-1 text-sm text-muted-foreground">Recommended. Authorize Gmail without storing an App Password.</p>
          </div>
          <a className={buttonVariants({ variant: "default", size: "sm" })} href="/api/gmail/oauth/start">Continue with Google</a>
        </div>
        <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void accountForm.handleSubmit(); }}>
          <p className="rounded-md bg-secondary/50 px-3 py-2 text-sm text-muted-foreground">Workspace: <span className="font-medium text-foreground">{user?.tenant?.name || "Current tenant"}</span></p>
          <accountForm.Field name="label" validators={{ onChange: ({ value }) => !value || value.length >= 2 ? undefined : "Nama koneksi minimal 2 karakter" }}>
            {(field) => <ControlledField field={field} label="Connection name" placeholder="Uses Gmail address by default" />}
          </accountForm.Field>
          <accountForm.Field name="smtpUser" validators={{ onChange: ({ value }) => gmailAccountSchema.shape.smtpUser.safeParse(value).success ? undefined : "Masukkan Gmail account yang valid" }}>
            {(field) => <ControlledField field={field} label="Gmail account" type="email" placeholder="account@gmail.com" />}
          </accountForm.Field>
          <accountForm.Field name="appPassword" validators={{ onChange: ({ value }) => value.length >= 8 ? undefined : "App Password wajib diisi" }}>
            {(field) => <ControlledField field={field} label="App Password" type="password" placeholder="Gmail App Password" />}
          </accountForm.Field>
          <Button type="submit"><accountForm.Subscribe selector={(state) => state.isSubmitting}>{(isSubmitting) => isSubmitting ? "Verifying..." : "Add Gmail account"}</accountForm.Subscribe></Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Send mail as addresses</CardTitle><CardDescription>Add verified aliases from Gmail. One Gmail account can have multiple sender addresses.</CardDescription></CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); event.stopPropagation(); void senderForm.handleSubmit(); }}>
          <senderForm.Field name="gmailAccountId" validators={{ onChange: ({ value }) => value ? undefined : "Pilih Gmail account terlebih dahulu" }}>
            {(field) => <FormField label="Gmail account" htmlFor={field.name} error={getFieldError(field.state.meta.errors)}><select id={field.name} name={field.name} value={field.state.value} onChange={(event) => field.handleChange(event.target.value)} onBlur={field.handleBlur} className={selectClass}><option value="">Choose a Gmail account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.label} ({account.smtpUser})</option>)}</select></FormField>}
          </senderForm.Field>
          <senderForm.Field name="name" validators={{ onChange: ({ value }) => value.length >= 2 ? undefined : "Nama sender minimal 2 karakter" }}>
            {(field) => <ControlledField field={field} label="Sender name" placeholder="Support team" />}
          </senderForm.Field>
          <senderForm.Field name="fromEmail" validators={{ onChange: ({ value }) => mailSenderSchema.shape.fromEmail.safeParse(value).success ? undefined : "Masukkan alamat sender yang valid" }}>
            {(field) => <ControlledField field={field} label="From email" type="email" placeholder="support@yourdomain.com" />}
          </senderForm.Field>
          <senderForm.Field name="isDefault">
            {(field) => <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" checked={field.state.value} onChange={(event) => field.handleChange(event.target.checked)} />Use as default sender</label>}
          </senderForm.Field>
          <Button type="submit" disabled={accounts.length === 0}>Add sender address</Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Configured senders</CardTitle><CardDescription>Only active senders are available in the send email form.</CardDescription></CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">Loading senders...</p> : error ? <p className="text-sm text-destructive">{error}</p> : accounts.length === 0 ? <p className="text-sm text-muted-foreground">No Gmail account configured.</p> : <div className="space-y-5">{accounts.map((account) => <div key={account.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{account.label}</p><p className="text-sm text-muted-foreground">{account.smtpUser}</p></div><div className="flex items-center gap-3"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{account.authType === "OAUTH" ? "Google OAuth" : "App Password"} · {account.status}</span><Button type="button" size="sm" variant="destructive" onClick={() => setDeleteTarget({ type: "account", id: account.id, name: account.smtpUser, senderCount: account.senders.length })}>Delete account</Button></div></div><div className="mt-4 space-y-2">{account.senders.length === 0 ? <p className="text-sm text-muted-foreground">No Send mail as address yet.</p> : account.senders.map((sender) => <div key={sender.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-secondary/50 px-3 py-2"><div><p className="text-sm font-medium">{sender.name} &lt;{sender.fromEmail}&gt;</p><p className="text-xs text-muted-foreground">{sender.isDefault ? "Default sender" : "Available sender"}{sender.isPrimary ? " / Built-in sender" : ""}</p></div><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled={sender.isDefault} onClick={async () => { await updateMailSender(sender.id, { isDefault: true }); await reload(); }}>{sender.isDefault ? "Default" : "Set default"}</Button>{sender.isPrimary ? <span className="inline-flex h-9 items-center rounded-md border border-input px-3 text-sm text-muted-foreground">Cannot delete</span> : <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteTarget({ type: "sender", id: sender.id, name: sender.fromEmail })}>Delete</Button>}</div></div>)}</div></div>)}</div>}
      </CardContent>
    </Card>
    <p className="text-sm text-muted-foreground">Need to configure the alias in Gmail first? Open Gmail Settings &gt; Accounts and Import &gt; Send mail as, then verify the address before adding it here.</p>
    <ConfirmationModal
      open={deleteTarget !== null}
      title={deleteTarget?.type === "account" ? "Delete Gmail account?" : "Delete email sender?"}
      description={deleteTarget?.type === "account" ? `Delete ${deleteTarget.name}? ${deleteTarget.senderCount} related sender(s) will also be deleted.` : `Delete ${deleteTarget?.name}? This action cannot be undone.`}
      confirmLabel="Delete"
      onClose={() => setDeleteTarget(null)}
      onConfirm={confirmDelete}
    />
  </div>;
}

export { MailSenderSetup };
