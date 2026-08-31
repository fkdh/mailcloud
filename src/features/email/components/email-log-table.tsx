import { Badge } from "../../../components/ui/badge";
import { EmptyState } from "../../../components/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import type { EmailLog } from "../types";

function EmailLogTable({ logs }: { logs: EmailLog[] }) {
  if (logs.length === 0) return <EmptyState title="No emails yet" description="Your sent messages will appear here." />;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader><TableRow><TableHead>Sender</TableHead><TableHead>Recipient</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
        <TableBody>{logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell><strong>{log.fromEmail || "Legacy sender"}</strong>{log.tenantName && <><br /><span className="text-muted-foreground">{log.tenantName}</span></>}</TableCell>
            <TableCell>{log.recipient}</TableCell>
            <TableCell>{log.subject}</TableCell>
            <TableCell><Badge variant={log.status === "SENT" ? "success" : "destructive"}>{log.status}</Badge></TableCell>
            <TableCell>{new Date(log.sentAt || log.createdAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
  );
}

export { EmailLogTable };
