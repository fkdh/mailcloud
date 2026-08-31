import { createHash, randomBytes } from "node:crypto";
import { and, eq, lte, or } from "drizzle-orm";
import { db } from "../database";
import { gmailAccounts, gmailOauthStates, mailSenders } from "../database/schema";
import { encryptSecret } from "../secret-crypto";
import { forbiddenResponse, getSessionUser, unauthorizedResponse } from "../auth";

const gmailScope = "https://mail.google.com/";

function hashState(state: string) {
  return createHash("sha256").update(state).digest("hex");
}

function oauthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
  return { clientId, clientSecret };
}

function redirectUri(request: Request) {
  return process.env.GOOGLE_REDIRECT_URI || new URL("/api/gmail/oauth/callback", request.url).toString();
}

function resultRedirect(request: Request, status: "connected" | "error", message?: string) {
  const url = new URL("/dashboard/senders", request.url);
  url.searchParams.set("gmail", status);
  if (message) url.searchParams.set("message", message.slice(0, 160));
  return Response.redirect(url, 303);
}

export async function handleGmailOauthStart(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorizedResponse();
  if (!user.tenantId) return forbiddenResponse();

  try {
    const { clientId } = oauthConfig();
    const state = randomBytes(32).toString("base64url");
    const now = new Date();
    await db.delete(gmailOauthStates).where(or(eq(gmailOauthStates.userId, user.id), lte(gmailOauthStates.expiresAt, now)));
    await db.insert(gmailOauthStates).values({
      stateHash: hashState(state),
      userId: user.id,
      tenantId: user.tenantId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri(request));
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", gmailScope);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("state", state);
    return Response.redirect(url, 302);
  } catch (error) {
    console.error("Gmail OAuth start error:", error instanceof Error ? error.message : error);
    return resultRedirect(request, "error", "Gmail OAuth is not configured");
  }
}

export async function handleGmailOauthCallback(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const stateHash = state ? hashState(state) : null;
  const [oauthState] = stateHash
    ? await db.select().from(gmailOauthStates).where(eq(gmailOauthStates.stateHash, stateHash)).limit(1)
    : [];
  if (stateHash) await db.delete(gmailOauthStates).where(eq(gmailOauthStates.stateHash, stateHash));
  await db.delete(gmailOauthStates).where(lte(gmailOauthStates.expiresAt, new Date()));
  if (!state || !code) return resultRedirect(request, "error", "Google authorization was cancelled");

  const user = await getSessionUser(request);
  if (!user) return resultRedirect(request, "error", "Your session expired. Please sign in again");

  if (!oauthState || oauthState.expiresAt <= new Date() || oauthState.userId !== user.id || oauthState.tenantId !== user.tenantId) {
    return resultRedirect(request, "error", "Invalid or expired OAuth state");
  }

  try {
    const { clientId, clientSecret } = oauthConfig();
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri(request),
        grant_type: "authorization_code",
      }),
    });
    const tokens = await tokenResponse.json() as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string };
    if (!tokenResponse.ok || !tokens.access_token) throw new Error(tokens.error || "Google token exchange failed");

    const profileResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileResponse.json() as { emailAddress?: string; error?: { message?: string } };
    const smtpUser = profile.emailAddress?.trim().toLowerCase();
    if (!profileResponse.ok || !smtpUser) {
      throw new Error(profile.error?.message || "Google did not return an email address");
    }

    const accessToken = encryptSecret(tokens.access_token);
    await db.transaction(async (transaction) => {
      const existing = await transaction.query.gmailAccounts.findFirst({
        where: and(eq(gmailAccounts.tenantId, oauthState.tenantId), eq(gmailAccounts.smtpUser, smtpUser)),
      });
      const oldRefreshToken = existing?.encryptedRefreshToken && existing.refreshTokenIv && existing.refreshTokenTag
        ? { value: existing.encryptedRefreshToken, iv: existing.refreshTokenIv, tag: existing.refreshTokenTag }
        : null;
      const refreshToken = tokens.refresh_token ? encryptSecret(tokens.refresh_token) : oldRefreshToken;
      if (!refreshToken) throw new Error("Google did not return a refresh token. Try connecting again.");

      const values = {
        label: existing?.label || smtpUser,
        smtpUser,
        authType: "OAUTH" as const,
        encryptedAppPassword: null,
        encryptionIv: null,
        encryptionTag: null,
        encryptedAccessToken: accessToken.value,
        accessTokenIv: accessToken.iv,
        accessTokenTag: accessToken.tag,
        encryptedRefreshToken: refreshToken.value,
        refreshTokenIv: refreshToken.iv,
        refreshTokenTag: refreshToken.tag,
        tokenExpiresAt: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
        status: "ACTIVE" as const,
        updatedAt: new Date(),
      };
      let accountId = existing?.id;
      if (accountId) {
        await transaction.update(gmailAccounts).set(values).where(eq(gmailAccounts.id, accountId));
      } else {
        const [account] = await transaction.insert(gmailAccounts).values({
          tenantId: oauthState.tenantId,
          createdBy: user.id,
          ...values,
        }).returning({ id: gmailAccounts.id });
        accountId = account.id;
      }

      const primarySender = await transaction.query.mailSenders.findFirst({
        where: and(eq(mailSenders.gmailAccountId, accountId), eq(mailSenders.fromEmail, smtpUser)),
      });
      if (!primarySender) {
        const defaultSender = await transaction.query.mailSenders.findFirst({
          where: and(eq(mailSenders.tenantId, oauthState.tenantId), eq(mailSenders.isDefault, true)),
        });
        await transaction.insert(mailSenders).values({
          tenantId: oauthState.tenantId,
          gmailAccountId: accountId,
          name: smtpUser,
          fromEmail: smtpUser,
          isDefault: !defaultSender,
          isPrimary: true,
          createdBy: user.id,
        });
      }
    });

    return resultRedirect(request, "connected");
  } catch (error) {
    console.error("Gmail OAuth callback error:", error instanceof Error ? error.message : error);
    return resultRedirect(request, "error", "Could not connect the Gmail account");
  }
}
