import argon2 from "argon2";
import { and, eq, gt, isNull } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db } from "../database";
import { passwordResetTokens, sessions, users } from "../database/schema";
import { hashToken } from "../auth";
import { forgotPasswordSchema, resetPasswordSchema } from "../../features/auth/validation";
import { sendPasswordResetEmail } from "./mailer";

const forgotPasswordMessage = "Jika akun dengan email tersebut aktif, link reset password telah dikirim.";
const resetPasswordError = "Link reset password tidak valid atau sudah kedaluwarsa.";
const resetTokenDurationMs = 60 * 60 * 1000;

export async function handleForgotPassword(request: Request) {
  try {
    const input = forgotPasswordSchema.parse(await request.json());
    const user = await db.query.users.findFirst({
      columns: { id: true, email: true, status: true },
      where: eq(users.email, input.email),
    });

    if (user?.status === "ACTIVE") {
      const rawToken = randomBytes(32).toString("base64url");
      const appUrl = process.env.APP_URL?.trim();
      if (!appUrl) throw new Error("APP_URL is required");

      const resetUrl = new URL("/reset-password", appUrl);
      resetUrl.searchParams.set("token", rawToken);

      await db.transaction(async (transaction) => {
        await transaction.delete(passwordResetTokens).where(and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt),
        ));
        await transaction.insert(passwordResetTokens).values({
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + resetTokenDurationMs),
        });
      });

      try {
        await sendPasswordResetEmail({ to: user.email, resetUrl: resetUrl.toString() });
      } catch (mailError) {
        console.error("Password reset email error:", mailError instanceof Error ? mailError.message : mailError);
      }
    }

    return Response.json({ message: forgotPasswordMessage });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Masukkan email yang valid" }, { status: 400 });
    }
    console.error("Forgot password error:", error instanceof Error ? error.message : error);
    return Response.json({ message: "Permintaan reset password gagal" }, { status: 500 });
  }
}

export async function handleResetPassword(request: Request) {
  try {
    const input = resetPasswordSchema.parse(await request.json());
    const passwordHash = await argon2.hash(input.password);
    const now = new Date();

    const resetSucceeded = await db.transaction(async (transaction) => {
      const [token] = await transaction.update(passwordResetTokens)
        .set({ usedAt: now })
        .where(and(
          eq(passwordResetTokens.tokenHash, hashToken(input.token)),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now),
        ))
        .returning({ userId: passwordResetTokens.userId });

      if (!token) return false;

      const [user] = await transaction.update(users)
        .set({ passwordHash, updatedAt: now })
        .where(and(eq(users.id, token.userId), eq(users.status, "ACTIVE")))
        .returning({ id: users.id });

      if (!user) throw new Error("Active user not found for password reset");
      await transaction.delete(sessions).where(eq(sessions.userId, user.id));
      return true;
    });

    if (!resetSucceeded) return Response.json({ message: resetPasswordError }, { status: 400 });
    return Response.json({ message: "Password berhasil diubah. Silakan login kembali." });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Password baru tidak valid" }, { status: 400 });
    }
    console.error("Reset password error:", error instanceof Error ? error.message : error);
    return Response.json({ message: resetPasswordError }, { status: 400 });
  }
}
