import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/layout/page-header";
import { Card, CardContent } from "../../components/ui/card";
import { ApprovalTable } from "../../features/users/components/approval-table";
import { useApprovals } from "../../features/users/hooks/use-approvals";

export const Route = createFileRoute("/dashboard/approvals")({
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { approvals, loading, message, decide } = useApprovals();

  return (
    <section className="space-y-8 p-6 lg:p-12">
      <PageHeader eyebrow="Superadmin" title="Admin approvals" description="Review new workspaces waiting for access." />
      <Card>
        <CardContent className="p-0">
          {loading ? <p className="p-6 text-sm text-muted-foreground">Loading approvals...</p> : message ? <p className="p-6 text-sm text-destructive">{message}</p> : <ApprovalTable approvals={approvals} onDecision={decide} />}
        </CardContent>
      </Card>
    </section>
  );
}
