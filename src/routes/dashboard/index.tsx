import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../../components/layout/page-header";
import { StatCard } from "../../components/layout/stat-card";
import { buttonVariants } from "../../components/ui/button";
import { useDashboardAnalytics } from "../../features/dashboard/hooks/use-dashboard-analytics";

export const Route = createFileRoute("/dashboard/")({ component: DashboardOverview });

function DashboardOverview() {
  const { analytics, loading, error } = useDashboardAnalytics();

  return (
    <section className="space-y-8 p-6 lg:p-12">
      <PageHeader
        eyebrow="Overview"
        title="Your email workspace"
        description="Send plain-text emails from your verified business address."
        action={<Link className={buttonVariants()} to="/dashboard/send-email">Send an email</Link>}
      />
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Sent today" value={loading ? "--" : String(analytics.sentToday)} detail={analytics.sentToday ? "Messages sent since midnight" : "Start your first campaign"} />
        <StatCard label="Delivery rate" value={loading ? "--" : analytics.deliveryRate === null ? "--" : `${analytics.deliveryRate}%`} detail={analytics.sent + analytics.failed ? `${analytics.sent} sent, ${analytics.failed} failed` : "No email history yet"} />
        <StatCard label="Senders" value={loading ? "--" : String(analytics.activeSenders)} detail={analytics.activeSenders ? "Active Gmail Send mail as addresses" : "Configure a sender first"} valueClassName="text-lg" />
      </div>
      <div className="rounded-xl border bg-card p-6"><p className="text-sm text-muted-foreground">Email activity is available in <Link className="font-semibold text-foreground underline" to="/dashboard/email-logs">Email history</Link>.</p></div>
    </section>
  );
}
