import { and, count, eq, gte } from "drizzle-orm";
import { db } from "../database";
import { emailLogs, gmailAccounts, mailSenders } from "../database/schema";
import { getSessionUser, unauthorizedResponse } from "../auth";

export async function handleDashboardAnalytics(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorizedResponse();

  const tenantFilter = user.tenantId ? eq(emailLogs.tenantId, user.tenantId) : undefined;
  const senderTenantFilter = user.tenantId ? eq(mailSenders.tenantId, user.tenantId) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [sentTodayRows, sentRows, failedRows, activeSenderRows] = await Promise.all([
    db.select({ value: count() }).from(emailLogs).where(tenantFilter ? and(tenantFilter, gte(emailLogs.createdAt, today)) : gte(emailLogs.createdAt, today)),
    db.select({ value: count() }).from(emailLogs).where(tenantFilter ? and(tenantFilter, eq(emailLogs.status, "SENT")) : eq(emailLogs.status, "SENT")),
    db.select({ value: count() }).from(emailLogs).where(tenantFilter ? and(tenantFilter, eq(emailLogs.status, "FAILED")) : eq(emailLogs.status, "FAILED")),
    db.select({ value: count() }).from(mailSenders)
      .innerJoin(gmailAccounts, eq(mailSenders.gmailAccountId, gmailAccounts.id))
      .where(senderTenantFilter
        ? and(senderTenantFilter, eq(mailSenders.status, "ACTIVE"), eq(gmailAccounts.status, "ACTIVE"))
        : and(eq(mailSenders.status, "ACTIVE"), eq(gmailAccounts.status, "ACTIVE"))),
  ]);

  const sentToday = Number(sentTodayRows[0]?.value ?? 0);
  const sent = Number(sentRows[0]?.value ?? 0);
  const failed = Number(failedRows[0]?.value ?? 0);
  const total = sent + failed;

  return Response.json({
    sentToday,
    sent,
    failed,
    deliveryRate: total === 0 ? null : Math.round((sent / total) * 1000) / 10,
    activeSenders: Number(activeSenderRows[0]?.value ?? 0),
  });
}
