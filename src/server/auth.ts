import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, lte } from "drizzle-orm";
import { db } from "./database";
import { sessions, tenants, users, type User } from "./database/schema";

const sessionCookieName = "mailcloud_session";
const sessionDurationMs = 1000 * 60 * 60 * 24 * 30;

export type AuthUser = User & {
  tenant: typeof tenants.$inferSelect | null;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const cookie = cookies.find((item) => item.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
}

function cookieHeader(token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export async function createSession(userId: string) {
  await cleanupExpiredSessions();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionDurationMs);

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return {
    token,
    cookie: cookieHeader(token, sessionDurationMs / 1000),
  };
}

export async function getSessionUser(request: Request): Promise<AuthUser | null> {
  await cleanupExpiredSessions();
  const token = getCookie(request, sessionCookieName);
  if (!token) return null;

  const result = await db
    .select({ user: users, tenant: tenants })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(tenants, eq(users.tenantId, tenants.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return result[0] ? { ...result[0].user, tenant: result[0].tenant } : null;
}

export async function deleteSession(request: Request) {
  await cleanupExpiredSessions();
  const token = getCookie(request, sessionCookieName);
  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }

  return cookieHeader("", 0);
}

async function cleanupExpiredSessions() {
  await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
}

export function unauthorizedResponse() {
  return Response.json({ message: "Authentication required" }, { status: 401 });
}

export function forbiddenResponse() {
  return Response.json({ message: "You do not have permission" }, { status: 403 });
}
