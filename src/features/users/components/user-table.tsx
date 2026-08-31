import { useState } from "react";
import { EmptyState } from "../../../components/empty-state";
import { Badge, type BadgeProps } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ConfirmationModal } from "../../../components/ui/confirmation-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { useCurrentUser } from "../../auth/hooks/use-current-user";
import { useToast } from "../../../components/ui/toast";
import { deleteUser, updateUserStatus } from "../user-services";
import type { UserRecord } from "../user-types";

const userStatuses: UserRecord["status"][] = ["ACTIVE", "PENDING", "REJECTED", "SUSPENDED"];

function UserTable({ users, onStatusUpdated }: { users: UserRecord[]; onStatusUpdated: () => Promise<void> }) {
  const currentUser = useCurrentUser();
  const { toast } = useToast();
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);

  if (users.length === 0) return <EmptyState title="No users yet" description="Registered users will appear here." />;

  async function handleStatusSave(userId: string, status: UserRecord["status"]) {
    try {
      await updateUserStatus(userId, status);
      setEditTarget(null);
      toast({ title: "User status updated", variant: "success" });
      await onStatusUpdated();
    } catch (error) {
      toast({ title: "Status update failed", description: error instanceof Error ? error.message : "Request failed", variant: "error" });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      toast({ title: "User deleted", variant: "success" });
      await onStatusUpdated();
    } catch (error) {
      toast({ title: "User deletion failed", description: error instanceof Error ? error.message : "Request failed", variant: "error" });
    }
  }

  return <>
    <div className="overflow-x-auto"><Table>
      <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Workspace</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Registered</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
      <TableBody>{users.map((user) => {
        const isSelf = user.id === currentUser?.id;
        return <TableRow key={user.id}>
          <TableCell><strong>{user.name}</strong><br /><span className="text-muted-foreground">{user.email}</span></TableCell>
          <TableCell>{user.tenant?.name || "-"}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell><Badge variant={statusVariant(user.status)}>{user.status}</Badge></TableCell>
          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
          <TableCell><div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="outline" className="size-9 p-0" disabled={isSelf} title={isSelf ? "You cannot edit your own account" : `Edit ${user.name}`} aria-label={isSelf ? "You cannot edit your own account" : `Edit ${user.name}`} onClick={() => setEditTarget(user)}><PencilIcon /></Button>
            <Button type="button" size="sm" variant="destructive" className="size-9 p-0" disabled={isSelf} title={isSelf ? "You cannot delete your own account" : `Delete ${user.name}`} aria-label={isSelf ? "You cannot delete your own account" : `Delete ${user.name}`} onClick={() => setDeleteTarget(user)}><TrashIcon /></Button>
          </div></TableCell>
        </TableRow>;
      })}</TableBody>
    </Table></div>
    <UserEditModal user={editTarget} onClose={() => setEditTarget(null)} onSave={handleStatusSave} />
    <ConfirmationModal
      open={deleteTarget !== null}
      title="Delete user?"
      description={deleteTarget ? <>Delete <strong>{deleteTarget.name}</strong> ({deleteTarget.email})? This action cannot be undone.</> : ""}
      confirmLabel="Delete user"
      confirmingLabel="Deleting..."
      onClose={() => setDeleteTarget(null)}
      onConfirm={handleDelete}
    />
  </>;
}

function UserEditModal({ user, onClose, onSave }: { user: UserRecord | null; onClose: () => void; onSave: (userId: string, status: UserRecord["status"]) => Promise<void> }) {
  const [status, setStatus] = useState<UserRecord["status"]>(user?.status || "PENDING");
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const target = user;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(target.id, status);
    } finally {
      setSaving(false);
    }
  }

  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="w-full max-w-md rounded-xl border bg-card p-6 text-card-foreground shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-user-title" onMouseDown={(event) => event.stopPropagation()}>
      <h2 id="edit-user-title" className="font-display text-lg font-semibold">Edit user status</h2>
      <p className="mt-2 text-sm text-muted-foreground">Update the access status for {target.name}.</p>
      <label className="mt-5 grid gap-2 text-sm font-medium text-foreground" htmlFor="user-status">Status
        <select id="user-status" className="h-10 rounded-md border border-input bg-background px-3 pr-10 text-sm font-normal" value={status} onChange={(event) => setStatus(event.target.value as UserRecord["status"])}>
          {userStatuses.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </div>
    </div>
  </div>;
}

function statusVariant(status: UserRecord["status"]): BadgeProps["variant"] {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

function PencilIcon() {
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 20 4.5-1 10.9-10.9a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z" /><path d="m14.5 6.5 3 3" /></svg>;
}

function TrashIcon() {
  return <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>;
}

export { UserTable };
