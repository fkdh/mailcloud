import { EmptyState } from "../../../components/empty-state";
import { Button } from "../../../components/ui/button";
import { ConfirmationModal } from "../../../components/ui/confirmation-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { useState } from "react";
import type { Approval, ApprovalDecision } from "../types";

type ApprovalTableProps = {
  approvals: Approval[];
  onDecision: (userId: string, decision: ApprovalDecision) => void | Promise<void>;
};

function ApprovalTable({ approvals, onDecision }: ApprovalTableProps) {
  const [decisionTarget, setDecisionTarget] = useState<{ approval: Approval; decision: ApprovalDecision } | null>(null);

  if (approvals.length === 0) return <EmptyState title="No pending approvals" description="New admin registrations will appear here." />;

  async function confirmDecision() {
    if (!decisionTarget) return;
    await onDecision(decisionTarget.approval.id, decisionTarget.decision);
    setDecisionTarget(null);
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader><TableRow><TableHead>Admin</TableHead><TableHead>Workspace</TableHead><TableHead>Registered</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
        <TableBody>{approvals.map((approval) => <TableRow key={approval.id}>
          <TableCell><strong>{approval.name}</strong><br /><span className="text-muted-foreground">{approval.email}</span></TableCell>
          <TableCell>{approval.tenant?.name || "-"}</TableCell>
          <TableCell>{new Date(approval.createdAt).toLocaleDateString()}</TableCell>
          <TableCell><div className="flex gap-2">
             <Button size="sm" type="button" onClick={() => setDecisionTarget({ approval, decision: "ACTIVE" })}>Approve</Button>
             <Button size="sm" variant="destructive" type="button" onClick={() => setDecisionTarget({ approval, decision: "REJECTED" })}>Reject</Button>
          </div></TableCell>
        </TableRow>)}</TableBody>
     </Table>
     <ConfirmationModal
       open={decisionTarget !== null}
       title={decisionTarget?.decision === "ACTIVE" ? "Approve this admin?" : "Reject this admin?"}
       description={decisionTarget ? <>{decisionTarget.decision === "ACTIVE" ? "Activate" : "Reject"} <strong>{decisionTarget.approval.name}</strong> and workspace <strong>{decisionTarget.approval.tenant?.name || "-"}</strong>?</> : ""}
       confirmLabel={decisionTarget?.decision === "ACTIVE" ? "Approve" : "Reject"}
       confirmingLabel={decisionTarget?.decision === "ACTIVE" ? "Approving..." : "Rejecting..."}
       confirmVariant={decisionTarget?.decision === "ACTIVE" ? "default" : "destructive"}
       onClose={() => setDecisionTarget(null)}
       onConfirm={confirmDecision}
     />
    </div>
  );
}

export { ApprovalTable };
