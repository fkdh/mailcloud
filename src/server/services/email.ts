import { desc, eq } from "drizzle-orm";
import { db } from "../database";
import { emailLogs, tenants } from "../database/schema";
import { forbiddenResponse, getSessionUser, unauthorizedResponse } from "../auth";
import { sendTextEmail } from "./mailer";
import { apiSendEmailSchema, sendEmailSchema } from "../../features/email/validation";
import { getDefaultSenderCredentials, getSenderCredentials } from "./mail-senders";
import { getApiTokenAuth, insufficientApiTokenScopeResponse, invalidApiTokenResponse } from "./api-tokens";

export async function handleSendEmail(request: Request) {
  let input: { senderId: string; to: string; subject: string; text: string } | undefined;

  try {
    const user = await getSessionUser(request);
    if (!user) return unauthorizedResponse();
    input = sendEmailSchema.parse(await request.json());
    const sender = await getSenderCredentials(input.senderId, user);
    if (!sender) return forbiddenResponse();
    const info = await sendTextEmail({
      credentials: {
        smtpUser: sender.smtpUser,
        ...(sender.appPassword ? { appPassword: sender.appPassword } : {}),
        ...(sender.accessToken ? { accessToken: sender.accessToken } : {}),
        ...(sender.refreshToken ? { refreshToken: sender.refreshToken } : {}),
      },
      fromEmail: sender.fromEmail,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    try {
      await db.insert(emailLogs).values({
        tenantId: sender.tenantId,
        userId: user.id,
        senderId: input.senderId,
        fromEmail: sender.fromEmail,
        recipient: input.to,
        subject: input.subject,
        text: input.text,
        status: "SENT",
        sentAt: new Date(),
      });
    } catch (logError) {
      console.error("Email sent but could not be logged:", logError);
    }

    return Response.json({ message: "Email berhasil dikirim", messageId: info.messageId });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "to, subject, dan text wajib diisi dengan benar" }, { status: 400 });
    }

    if (input) {
      try {
        const user = await getSessionUser(request);
        const sender = user && input ? await getSenderCredentials(input.senderId, user) : null;
        if (user && sender) {
          await db.insert(emailLogs).values({
            tenantId: sender.tenantId,
            userId: user.id,
            senderId: input.senderId,
            fromEmail: sender.fromEmail,
            recipient: input.to,
            subject: input.subject,
            text: input.text,
            status: "FAILED",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } catch (logError) {
        console.error("Could not log failed email:", logError);
      }
    }

    console.error("Gagal mengirim email:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Gagal mengirim email" }, { status: 500 });
  }
}

export async function handleApiSendEmail(request: Request) {
  const auth = await getApiTokenAuth(request);
  if (!auth) return invalidApiTokenResponse();
  if (auth.token.scope !== "EMAILS_SEND") return insufficientApiTokenScopeResponse();

  let input: { senderId?: string; to: string; subject: string; text: string };
  try {
    input = apiSendEmailSchema.parse(await request.json());
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "to, subject, dan text wajib diisi dengan benar" }, { status: 400 });
    }
    return Response.json({ message: "Request tidak valid" }, { status: 400 });
  }

  const sender = input.senderId
    ? await getSenderCredentials(input.senderId, auth.user)
    : await getDefaultSenderCredentials(auth.user);
  if (!sender) {
    return Response.json({ message: input.senderId ? "Sender tidak ditemukan atau tidak aktif" : "Belum ada sender default yang aktif" }, { status: 422 });
  }

  try {
    const info = await sendTextEmail({
      credentials: {
        smtpUser: sender.smtpUser,
        ...(sender.appPassword ? { appPassword: sender.appPassword } : {}),
        ...(sender.accessToken ? { accessToken: sender.accessToken } : {}),
        ...(sender.refreshToken ? { refreshToken: sender.refreshToken } : {}),
      },
      fromEmail: sender.fromEmail,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    await db.insert(emailLogs).values({
      tenantId: sender.tenantId,
      userId: auth.user.id,
      senderId: sender.senderId,
      fromEmail: sender.fromEmail,
      recipient: input.to,
      subject: input.subject,
      text: input.text,
      status: "SENT",
      sentAt: new Date(),
    });

    return Response.json({ message: "Email berhasil dikirim", messageId: info.messageId });
  } catch (error) {
    try {
      await db.insert(emailLogs).values({
        tenantId: sender.tenantId,
        userId: auth.user.id,
        senderId: sender.senderId,
        fromEmail: sender.fromEmail,
        recipient: input.to,
        subject: input.subject,
        text: input.text,
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    } catch (logError) {
      console.error("Could not log failed API email:", logError);
    }

    console.error("Gagal mengirim email melalui API:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Gagal mengirim email" }, { status: 500 });
  }
}

export async function handleEmailLogs(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorizedResponse();

  const logs = await db
    .select({
      id: emailLogs.id,
      recipient: emailLogs.recipient,
      subject: emailLogs.subject,
      fromEmail: emailLogs.fromEmail,
      tenantName: tenants.name,
      status: emailLogs.status,
      errorMessage: emailLogs.errorMessage,
      sentAt: emailLogs.sentAt,
      createdAt: emailLogs.createdAt,
    })
    .from(emailLogs)
    .innerJoin(tenants, eq(emailLogs.tenantId, tenants.id))
    .where(user.role === "SUPERADMIN" ? undefined : eq(emailLogs.tenantId, user.tenantId!))
    .orderBy(desc(emailLogs.createdAt))
    .limit(50);

  return Response.json({ logs });
}
