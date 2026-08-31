import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/layout/page-header";
import { Card, CardContent } from "../../components/ui/card";
import { EmailLogTable } from "../../features/email/components/email-log-table";
import { useEmailLogs } from "../../features/email/hooks/use-email-logs";

export const Route = createFileRoute("/dashboard/email-logs")({
  component: EmailLogsPage,
});

function EmailLogsPage() {
  const { logs, loading, error } = useEmailLogs();

  return (
    <section className="space-y-8 p-6 lg:p-12">
      <PageHeader eyebrow="Activity" title="Email history" description="Recent email activity for this workspace." />
      <Card>
        <CardContent className="p-0">
          {loading ? <p className="p-6 text-sm text-muted-foreground">Loading email history...</p> : error ? <p className="p-6 text-sm text-destructive">{error}</p> : <EmailLogTable logs={logs} />}
        </CardContent>
      </Card>
    </section>
  );
}
