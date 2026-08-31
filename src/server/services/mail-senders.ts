import { and, asc, eq } from "drizzle-orm";
import { db } from "../database";
import { gmailAccounts, mailSenders, tenants } from "../database/schema";
import { decryptSecret, encryptSecret } from "../secret-crypto";
import { forbiddenResponse, getSessionUser, unauthorizedResponse } from "../auth";
import { gmailAccountSchema, mailSenderSchema, mailSenderUpdateSchema } from "../../features/email/sender-validation";
import { verifyGmailAccount } from "./mailer";

async function requireUser(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return { response: unauthorizedResponse() };
  if (!user.tenantId) return { response: forbiddenResponse() };
  return { user };
}

export async function handleMailConfiguration(request: Request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;

  const tenantId = auth.user.tenantId;
  if (!tenantId) return forbiddenResponse();
  const where = eq(tenants.id, tenantId);
  const [tenantRows, rows] = await Promise.all([
    db.select({ id: tenants.id, name: tenants.name }).from(tenants).where(where).orderBy(asc(tenants.name)),
    db.select({
      accountId: gmailAccounts.id,
      tenantId: gmailAccounts.tenantId,
      tenantName: tenants.name,
       label: gmailAccounts.label,
       smtpUser: gmailAccounts.smtpUser,
       authType: gmailAccounts.authType,
       accountStatus: gmailAccounts.status,
      senderId: mailSenders.id,
      senderName: mailSenders.name,
      fromEmail: mailSenders.fromEmail,
       senderStatus: mailSenders.status,
       isDefault: mailSenders.isDefault,
       isPrimary: mailSenders.isPrimary,
    }).from(gmailAccounts)
      .innerJoin(tenants, eq(gmailAccounts.tenantId, tenants.id))
      .leftJoin(mailSenders, eq(gmailAccounts.id, mailSenders.gmailAccountId))
      .where(where)
      .orderBy(asc(tenants.name), asc(gmailAccounts.label), asc(mailSenders.name)),
  ]);

  const accountMap = new Map<string, {
    id: string;
    tenantId: string;
    tenantName: string;
     label: string;
     smtpUser: string;
     authType: "APP_PASSWORD" | "OAUTH";
     status: "ACTIVE" | "DISABLED";
    senders: Array<{
      id: string;
      tenantId: string;
      tenantName: string;
      gmailAccountId: string;
      name: string;
      fromEmail: string;
       status: "ACTIVE" | "DISABLED";
       isDefault: boolean;
       isPrimary: boolean;
    }>;
  }>();

  for (const row of rows) {
    const account = accountMap.get(row.accountId) || {
      id: row.accountId,
      tenantId: row.tenantId,
      tenantName: row.tenantName,
       label: row.label,
       smtpUser: row.smtpUser,
       authType: row.authType,
       status: row.accountStatus,
      senders: [],
    };
    if (row.senderId) {
      account.senders.push({
        id: row.senderId,
        tenantId: row.tenantId,
        tenantName: row.tenantName,
        gmailAccountId: row.accountId,
        name: row.senderName!,
        fromEmail: row.fromEmail!,
         status: row.senderStatus!,
         isDefault: row.isDefault!,
         isPrimary: row.isPrimary!,
      });
    }
    accountMap.set(row.accountId, account);
  }

  return Response.json({ tenants: tenantRows, accounts: [...accountMap.values()] });
}

export async function handleCreateGmailAccount(request: Request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;

  try {
    const input = gmailAccountSchema.parse(await request.json());
    const tenantId = auth.user.tenantId;
    if (!tenantId) return forbiddenResponse();
    const appPassword = input.appPassword.replace(/\s/g, "");

    await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) }).then((tenant) => {
      if (!tenant) throw new Error("Tenant tidak ditemukan");
    });
    await verifyGmailAccount({ smtpUser: input.smtpUser, appPassword });
    const encrypted = encryptSecret(appPassword);

    await db.transaction(async (transaction) => {
      const existingDefault = await transaction.query.mailSenders.findFirst({
        columns: { id: true },
        where: and(eq(mailSenders.tenantId, tenantId), eq(mailSenders.isDefault, true)),
      });
      const [account] = await transaction.insert(gmailAccounts).values({
        tenantId,
        label: input.label.trim() || input.smtpUser,
        smtpUser: input.smtpUser,
        encryptedAppPassword: encrypted.value,
        encryptionIv: encrypted.iv,
        encryptionTag: encrypted.tag,
        createdBy: auth.user.id,
      }).returning({ id: gmailAccounts.id });

      await transaction.insert(mailSenders).values({
        tenantId,
        gmailAccountId: account.id,
        name: input.smtpUser,
        fromEmail: input.smtpUser,
        isDefault: !existingDefault,
        isPrimary: true,
        createdBy: auth.user.id,
      });
    });

    return Response.json({ message: "Gmail account berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Data Gmail account tidak valid" }, { status: 400 });
    }
    console.error("Create Gmail account error:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Gmail account gagal diverifikasi atau ditambahkan" }, { status: 400 });
  }
}

export async function handleCreateMailSender(request: Request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;

  try {
    const input = mailSenderSchema.parse(await request.json());
    const account = await db.query.gmailAccounts.findFirst({
      where: eq(gmailAccounts.id, input.gmailAccountId),
    });
    if (!account || account.tenantId !== auth.user.tenantId) return forbiddenResponse();

    const existingDefault = await db.query.mailSenders.findFirst({
      columns: { id: true },
      where: and(eq(mailSenders.tenantId, account.tenantId), eq(mailSenders.isDefault, true)),
    });
    const isDefault = input.isDefault || !existingDefault;

    await db.transaction(async (transaction) => {
      if (isDefault) {
        await transaction.update(mailSenders).set({ isDefault: false, updatedAt: new Date() })
          .where(eq(mailSenders.tenantId, account.tenantId));
      }
      await transaction.insert(mailSenders).values({
        tenantId: account.tenantId,
        gmailAccountId: account.id,
        name: input.name,
        fromEmail: input.fromEmail,
        isDefault,
        createdBy: auth.user.id,
      });
    });

    return Response.json({ message: "Email sender berhasil ditambahkan" }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Data email sender tidak valid" }, { status: 400 });
    }
    console.error("Create sender error:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Email sender gagal ditambahkan" }, { status: 400 });
  }
}

export async function handleMailSenderUpdate(request: Request, senderId: string) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;

  try {
    const input = mailSenderUpdateSchema.parse(await request.json());
    const sender = await db.query.mailSenders.findFirst({ where: eq(mailSenders.id, senderId) });
    if (!sender || sender.tenantId !== auth.user.tenantId) return forbiddenResponse();

    await db.transaction(async (transaction) => {
      if (input.isDefault) {
        await transaction.update(mailSenders).set({ isDefault: false, updatedAt: new Date() })
          .where(eq(mailSenders.tenantId, sender.tenantId));
      }
      await transaction.update(mailSenders).set({ ...input, updatedAt: new Date() })
        .where(eq(mailSenders.id, senderId));
    });
    return Response.json({ message: "Email sender berhasil diperbarui" });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Data email sender tidak valid" }, { status: 400 });
    }
    return Response.json({ message: "Email sender gagal diperbarui" }, { status: 400 });
  }
}

export async function handleMailSenderDelete(request: Request, senderId: string) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  const sender = await db.query.mailSenders.findFirst({ where: eq(mailSenders.id, senderId) });
  if (!sender || sender.tenantId !== auth.user.tenantId) return forbiddenResponse();
  if (sender.isPrimary) return Response.json({ message: "Primary sender hanya dapat dihapus bersama Gmail account" }, { status: 409 });
  await db.delete(mailSenders).where(eq(mailSenders.id, senderId));
  return Response.json({ message: "Email sender berhasil dihapus" });
}

export async function handleGmailAccountDelete(request: Request, accountId: string) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;

  const account = await db.query.gmailAccounts.findFirst({
    columns: { id: true, tenantId: true },
    where: eq(gmailAccounts.id, accountId),
  });
  if (!account || account.tenantId !== auth.user.tenantId) return forbiddenResponse();

  await db.transaction(async (transaction) => {
    await transaction.delete(mailSenders).where(eq(mailSenders.gmailAccountId, accountId));
    await transaction.delete(gmailAccounts).where(eq(gmailAccounts.id, accountId));
  });

  return Response.json({ message: "Gmail account dan sender terkait berhasil dihapus" });
}

export async function getSenderCredentials(senderId: string, user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>) {
  const result = await db.select({
    sender: mailSenders,
    account: gmailAccounts,
  }).from(mailSenders)
    .innerJoin(gmailAccounts, eq(mailSenders.gmailAccountId, gmailAccounts.id))
    .where(eq(mailSenders.id, senderId))
    .limit(1);
  const selected = result[0];
  if (!selected || selected.sender.status !== "ACTIVE" || selected.account.status !== "ACTIVE") return null;
  if (selected.sender.tenantId !== user.tenantId) return null;

  const credentials = selected.account.authType === "OAUTH"
    ? selected.account.encryptedAccessToken && selected.account.accessTokenIv && selected.account.accessTokenTag && selected.account.encryptedRefreshToken && selected.account.refreshTokenIv && selected.account.refreshTokenTag
      ? {
          accessToken: decryptSecret(selected.account.encryptedAccessToken, selected.account.accessTokenIv, selected.account.accessTokenTag),
          refreshToken: decryptSecret(selected.account.encryptedRefreshToken, selected.account.refreshTokenIv, selected.account.refreshTokenTag),
        }
      : null
    : selected.account.encryptedAppPassword && selected.account.encryptionIv && selected.account.encryptionTag
      ? { appPassword: decryptSecret(selected.account.encryptedAppPassword, selected.account.encryptionIv, selected.account.encryptionTag) }
      : null;
  if (!credentials) return null;

  return {
    tenantId: selected.sender.tenantId,
    fromEmail: selected.sender.fromEmail,
    smtpUser: selected.account.smtpUser,
    ...credentials,
  };
}
