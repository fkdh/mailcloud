import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/layout/page-header";
import { MailSenderSetup } from "../../features/email/components/mail-sender-setup";

export const Route = createFileRoute("/dashboard/senders")({ component: SendersPage });

function SendersPage() {
  return <section className="mx-auto w-full max-w-5xl space-y-8 p-6 lg:p-12">
    <PageHeader eyebrow="Settings" title="Gmail settings" description="Configure the Gmail account and verified Send mail as addresses for this workspace." />
    <MailSenderSetup />
  </section>;
}
