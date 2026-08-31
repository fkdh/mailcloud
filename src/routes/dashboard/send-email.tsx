import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/layout/page-header";
import { Card, CardContent } from "../../components/ui/card";
import { SendEmailForm } from "../../features/email/components/send-email-form";

export const Route = createFileRoute("/dashboard/send-email")({
  component: SendEmailPage,
});

function SendEmailPage() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-8 p-6 lg:p-12">
      <PageHeader eyebrow="Compose" title="Send an email" description="Send a plain-text message from your business address." />
      <Card>
        <CardContent className="pt-6"><SendEmailForm /></CardContent>
      </Card>
    </section>
  );
}
