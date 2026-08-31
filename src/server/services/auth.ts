import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../database";
import { accountActivationTokens, tenants, users } from "../database/schema";
import { createSession, hashToken } from "../auth";
import { loginSchema, registerSchema } from "../../features/auth/validation";
import { sendAccountActivationEmail, validateSystemMailConfig } from "./mailer";

function slugify(value: string) {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "workspace"}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function handleLogin(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });

    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      return Response.json({ message: "Email atau password salah" }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return Response.json({ message: "Akun belum aktif atau telah dinonaktifkan" }, { status: 403 });
    }

    const session = await createSession(user.id);
    return Response.json(
      { message: "Login berhasil" },
      { headers: { "Set-Cookie": session.cookie } },
    );
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Data login tidak valid" }, { status: 400 });
    }
    console.error("Login error:", error);
    return Response.json({ message: "Login gagal" }, { status: 500 });
  }
}

export async function handleRegister(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());

    const existingUser = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.email, input.email),
    });

    if (existingUser) {
      return Response.json({ message: "Email sudah terdaftar" }, { status: 409 });
    }

    const passwordHash = await argon2.hash(input.password);
    const appUrl = process.env.APP_URL?.trim();
    if (!appUrl) throw new Error("APP_URL is required");
    validateSystemMailConfig();
    const activationUrl = new URL("/api/activate", appUrl);
    const rawActivationToken = randomBytes(32).toString("base64url");
    activationUrl.searchParams.set("token", rawActivationToken);

    let createdAccount: { userId: string; tenantId: string };

    createdAccount = await db.transaction(async (transaction) => {
      const [tenant] = await transaction.insert(tenants).values({
        name: input.tenantName,
        slug: slugify(input.tenantName),
        status: "PENDING",
      }).returning({ id: tenants.id });

      const [user] = await transaction.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        role: "ADMIN",
        tenantId: tenant.id,
        status: "PENDING",
      }).returning({ id: users.id });

      await transaction.insert(accountActivationTokens).values({
        userId: user.id,
        tokenHash: hashToken(rawActivationToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      return { userId: user.id, tenantId: tenant.id };
    });

    try {
      await sendAccountActivationEmail({ to: input.email, activationUrl: activationUrl.toString() });
    } catch (mailError) {
      await db.transaction(async (transaction) => {
        await transaction.delete(users).where(eq(users.id, createdAccount.userId));
        await transaction.delete(tenants).where(eq(tenants.id, createdAccount.tenantId));
      });
      throw mailError;
    }

    return Response.json({ message: "Account created. Check your email to activate your account." }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Data registrasi tidak valid" }, { status: 400 });
    }

    console.error("Register error:", error);
    return Response.json({ message: "Registrasi gagal" }, { status: 500 });
  }
}

function hasConstraintError(error: unknown, constraint: string) {
  let current: unknown = error;

  while (current instanceof Error) {
    const cause = current.cause as { constraint_name?: string } | undefined;
    if (cause?.constraint_name === constraint) return true;
    current = current.cause;
  }

  return false;
}
