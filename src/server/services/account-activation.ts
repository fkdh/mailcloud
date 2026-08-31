import { and, eq, gt, inArray, isNull } from "drizzle-orm";
import { db } from "../database";
import { accountActivationTokens, tenants, users } from "../database/schema";
import { hashToken } from "../auth";

function loginRedirect(request: Request, result: "success" | "invalid") {
  const url = new URL("/login", request.url);
  url.searchParams.set("activation", result);
  return Response.redirect(url, 303);
}

export async function handleActivateAccount(request: Request) {
  const rawToken = new URL(request.url).searchParams.get("token");
  if (!rawToken) return loginRedirect(request, "invalid");

  const now = new Date();
  try {
    const activated = await db.transaction(async (transaction) => {
      const [token] = await transaction.update(accountActivationTokens)
        .set({ usedAt: now })
        .where(and(
          eq(accountActivationTokens.tokenHash, hashToken(rawToken)),
          isNull(accountActivationTokens.usedAt),
          gt(accountActivationTokens.expiresAt, now),
        ))
        .returning({ userId: accountActivationTokens.userId });

      if (!token) return false;

      const [user] = await transaction.update(users)
        .set({ status: "ACTIVE", updatedAt: now })
        .where(and(
          eq(users.id, token.userId),
          inArray(users.status, ["PENDING", "ACTIVE"]),
        ))
        .returning({ id: users.id, tenantId: users.tenantId });

      if (!user) throw new Error("User cannot be activated");

      if (user.tenantId) {
        await transaction.update(tenants)
          .set({ status: "ACTIVE", updatedAt: now })
          .where(and(eq(tenants.id, user.tenantId), eq(tenants.status, "PENDING")));
      }

      return true;
    });

    return loginRedirect(request, activated ? "success" : "invalid");
  } catch (error) {
    console.error("Account activation error:", error instanceof Error ? error.message : error);
    return loginRedirect(request, "invalid");
  }
}
