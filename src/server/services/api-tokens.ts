import { and, asc, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "../database";
import { apiTokens, tenants, users, type ApiToken } from "../database/schema";
import { getSessionUser, hashToken, unauthorizedResponse, forbiddenResponse, type AuthUser } from "../auth";

export const EMAILS_SEND_SCOPE = "emails:send" as const;
const tokenPrefix = "mc_live_";

const createApiTokenSchema = z.object({
  name: z.string().trim().min(1, "Nama token wajib diisi").max(120, "Nama token terlalu panjang").default("Email sending token"),
});

export type ApiTokenAuth = {
  token: ApiToken;
  user: AuthUser;
};

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] ?? null;
}

export async function getApiTokenAuth(request: Request): Promise<ApiTokenAuth | null> {
  const rawToken = bearerToken(request);
  if (!rawToken) return null;

  const result = await db
    .select({ token: apiTokens, user: users, tenant: tenants })
    .from(apiTokens)
    .innerJoin(users, eq(apiTokens.userId, users.id))
    .innerJoin(tenants, eq(apiTokens.tenantId, tenants.id))
    .where(and(
      eq(apiTokens.tokenHash, hashToken(rawToken)),
      eq(users.status, "ACTIVE"),
      eq(tenants.status, "ACTIVE"),
    ))
    .limit(1);

  const selected = result[0];
  if (!selected) return null;

  return {
    token: selected.token,
    user: { ...selected.user, tenant: selected.tenant },
  };
}

export function invalidApiTokenResponse() {
  return Response.json({ message: "API token tidak valid atau sudah dihapus" }, { status: 401 });
}

export function insufficientApiTokenScopeResponse() {
  return Response.json({ message: "API token tidak memiliki scope emails:send" }, { status: 403 });
}

function tokenSummary(token: ApiToken) {
  return {
    id: token.id,
    name: token.name,
    prefix: token.tokenPrefix,
    scope: EMAILS_SEND_SCOPE,
    createdAt: token.createdAt,
  };
}

export async function handleApiTokens(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorizedResponse();
  if (!user.tenantId) return forbiddenResponse();

  if (request.method === "GET") {
    const tokens = await db.query.apiTokens.findMany({
      where: and(eq(apiTokens.userId, user.id), eq(apiTokens.tenantId, user.tenantId)),
      orderBy: [asc(apiTokens.createdAt)],
    });
    return Response.json({ tokens: tokens.map(tokenSummary) });
  }

  try {
    const input = createApiTokenSchema.parse(await request.json());
    const rawToken = `${tokenPrefix}${randomBytes(32).toString("base64url")}`;
    const [token] = await db.insert(apiTokens).values({
      userId: user.id,
      tenantId: user.tenantId,
      name: input.name,
      tokenPrefix: rawToken.slice(0, 20),
      tokenHash: hashToken(rawToken),
      scope: "EMAILS_SEND",
    }).returning();

    return Response.json({
      token: rawToken,
      tokenInfo: tokenSummary(token),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Nama token tidak valid" }, { status: 400 });
    }
    console.error("Create API token error:", error instanceof Error ? error.message : error);
    return Response.json({ message: "API token gagal dibuat" }, { status: 500 });
  }
}

export async function handleApiTokenDelete(request: Request, tokenId: string) {
  const user = await getSessionUser(request);
  if (!user) return unauthorizedResponse();
  if (!user.tenantId) return forbiddenResponse();

  const result = await db.delete(apiTokens)
    .where(and(
      eq(apiTokens.id, tokenId),
      eq(apiTokens.userId, user.id),
      eq(apiTokens.tenantId, user.tenantId),
    ))
    .returning({ id: apiTokens.id });

  if (!result[0]) return Response.json({ message: "API token tidak ditemukan" }, { status: 404 });
  return Response.json({ message: "API token berhasil dihapus" });
}
