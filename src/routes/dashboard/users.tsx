import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "../../components/ui/card";
import { PageHeader } from "../../components/layout/page-header";
import { UserTable } from "../../features/users/components/user-table";
import { useUsers } from "../../features/users/hooks/use-users";

export const Route = createFileRoute("/dashboard/users")({ component: UsersPage });

function UsersPage() {
  const { users, loading, error, reload } = useUsers();
  return <section className="space-y-8 p-6 lg:p-12">
    <PageHeader eyebrow="Superadmin" title="All users" description="View users and their tenant access across the platform." />
     <Card><CardContent className="p-0">{loading ? <p className="p-6 text-sm text-muted-foreground">Loading users...</p> : error ? <p className="p-6 text-sm text-destructive">{error}</p> : <UserTable users={users} onStatusUpdated={reload} />}</CardContent></Card>
  </section>;
}
