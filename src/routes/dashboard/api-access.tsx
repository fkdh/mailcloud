import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { PageHeader } from "../../components/layout/page-header";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { ConfirmationModal } from "../../components/ui/confirmation-modal";
import { Input } from "../../components/ui/input";
import { apiRequest } from "../../lib/api";
import { useMailConfiguration } from "../../features/email/hooks/use-mail-configuration";

type ApiToken = {
  id: string;
  name: string;
  prefix: string;
  scope: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export const Route = createFileRoute("/dashboard/api-access")({ component: ApiAccessPage });

function ApiAccessPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSenderId, setCopiedSenderId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiToken | null>(null);
  const { accounts, loading: sendersLoading } = useMailConfiguration();

  async function loadTokens() {
    try {
      const result = await apiRequest<{ tokens: ApiToken[] }>("/api/api-tokens");
      setTokens(result.tokens);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Gagal memuat API token");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadTokens(); }, []);

  async function createToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await apiRequest<{ token: string; tokenInfo: ApiToken }>("/api/api-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "Email sending token" }),
      });
      setTokens((current) => [...current, result.tokenInfo]);
      setNewToken(result.token);
      setName("");
      setCopied(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "API token gagal dibuat");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDeleteToken() {
    if (!deleteTarget) return;
    try {
      await apiRequest(`/api/api-tokens/${deleteTarget.id}`, { method: "DELETE" });
      setTokens((current) => current.filter((token) => token.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "API token gagal dihapus");
    }
  }

  async function copyToken() {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
  }

  async function copySenderId(senderId: string) {
    await navigator.clipboard.writeText(senderId);
    setCopiedSenderId(senderId);
  }

  const curlExample = [
    "curl -X POST https://your-mailcloud-domain.com/api/v1/emails/send \\",
    "  -H \"Authorization: Bearer mc_live_your_token\" \\",
    "  -H \"Content-Type: application/json\" \\",
    "  -d '{",
    '    "senderId": "sender-uuid-from-gmail-settings",',
    '    "to": "customer@example.com",',
    '    "subject": "Hello from Mailcloud",',
    '    "text": "This email was sent through the Mailcloud API."',
    "  }'",
  ].join("\n");

  return <section className="mx-auto w-full max-w-5xl space-y-8 p-6 lg:p-12">
    <PageHeader eyebrow="Developer tools" title="API Access & Integrations" description="Create a secure token for sending email from an external application." />

    {/* {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" role="alert">{error}</p>} */}

    {newToken && <Card className="border-primary/40 bg-primary/5">
      <CardHeader>
        <CardTitle>Copy your token now</CardTitle>
        <CardDescription>This token will not be shown again. Store it in your external app's secret settings.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <code className="min-w-0 flex-1 break-all rounded-md border bg-background px-3 py-2 text-sm text-foreground">{newToken}</code>
        <Button type="button" variant="outline" onClick={() => void copyToken()}>{copied ? "Copied" : "Copy token"}</Button>
      </CardContent>
    </Card>}

    <Card>
      <CardHeader>
        <CardTitle>Create an API token</CardTitle>
        <CardDescription>Tokens currently have one permission: send email using an active sender in this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => void createToken(event)}>
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Token name, e.g. n8n production" maxLength={120} aria-label="Token name" />
          <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create token"}</Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Sender IDs</CardTitle>
        <CardDescription>Copy a sender ID to select a specific verified sender in your API request. You can also omit it to use the default sender.</CardDescription>
      </CardHeader>
      <CardContent>
        {sendersLoading ? <p className="text-sm text-muted-foreground">Loading sender IDs...</p> : accounts.flatMap((account) => account.senders).length === 0 ? <p className="text-sm text-muted-foreground">No sender configured. <Link className="font-semibold text-foreground underline" to="/dashboard/senders">Configure a sender first.</Link></p> : <div className="space-y-2">
          {accounts.flatMap((account) => account.senders).map((sender) => <div key={sender.id} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0"><p className="text-sm font-medium text-foreground">{sender.name} &lt;{sender.fromEmail}&gt;</p><code className="mt-1 block truncate text-xs text-muted-foreground">{sender.id}</code></div>
            <Button type="button" size="sm" variant="outline" onClick={() => void copySenderId(sender.id)}>{copiedSenderId === sender.id ? "Copied" : "Copy sender ID"}</Button>
          </div>)}
        </div>}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Your tokens</CardTitle>
        <CardDescription>Use the token as a Bearer token in the Authorization header.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">Loading tokens...</p> : tokens.length === 0 ? <p className="text-sm text-muted-foreground">No API tokens yet.</p> : <div className="divide-y rounded-md border">
          {tokens.map((token) => <div key={token.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{token.name}</p>
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{token.prefix}...</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">{token.scope}</Badge>
                <span>Created {formatDate(token.createdAt)}</span>
                {token.lastUsedAt && <span>Last used {formatDate(token.lastUsedAt)}</span>}
              </div>
            </div>
            <Button type="button" variant="destructive" size="sm" onClick={() => setDeleteTarget(token)}>Delete</Button>
          </div>)}
        </div>}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Send an email</CardTitle>
        <CardDescription>Use your workspace's default active sender, or include a specific sender ID. Each token can make up to 30 requests per minute.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div>
          <p className="mb-2 font-semibold text-foreground">Endpoint</p>
          <code className="block overflow-x-auto rounded-md bg-secondary p-3 text-xs text-foreground">POST /api/v1/emails/send</code>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Example</p>
          <pre className="overflow-x-auto rounded-md bg-secondary p-4 text-xs leading-6 text-foreground"><code>{curlExample}</code></pre>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Request body</p>
          <ul className="grid gap-2 text-muted-foreground">
            <li><code className="text-foreground">to</code> required recipient email address.</li>
            <li><code className="text-foreground">subject</code> required email subject.</li>
            <li><code className="text-foreground">text</code> required plain-text message.</li>
            <li><code className="text-foreground">senderId</code> optional sender UUID. Omit it to use the default sender.</li>
          </ul>
        </div>
      </CardContent>
    </Card>

    <ConfirmationModal
      open={deleteTarget !== null}
      title="Delete API token?"
      description={deleteTarget ? `Delete ${deleteTarget.name}? Any integration using this token will stop immediately.` : ""}
      confirmLabel="Delete"
      confirmingLabel="Deleting..."
      onClose={() => setDeleteTarget(null)}
      onConfirm={confirmDeleteToken}
    />
  </section>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
