import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useCurrentUser } from "../../features/auth/hooks/use-current-user";

export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });

function ProfilePage() {
  const user = useCurrentUser();
  const initials = user?.name?.slice(0, 1).toUpperCase() || "A";

  return <section className="mx-auto w-full max-w-4xl space-y-8 p-6 lg:p-12">
    <PageHeader eyebrow="Account" title="Your profile" description="View your account details and active workspace." />
    <Card>
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-primary font-display text-3xl font-bold text-primary-foreground" aria-hidden="true">{initials}</div>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-semibold text-foreground">{user?.name || "Loading profile..."}</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground">{user?.email || ""}</p>
          {user && <Badge className="mt-3" variant="secondary">{user.role}</Badge>}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Workspace details</CardTitle></CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <ProfileField label="Workspace" value={user?.tenant?.name || "Loading..."} />
        <ProfileField label="Account status" value={user?.status || "Loading..."} />
      </CardContent>
    </Card>
  </section>;
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border bg-secondary/40 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-sm font-medium text-foreground">{value}</p></div>;
}
