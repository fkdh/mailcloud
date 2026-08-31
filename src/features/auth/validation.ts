import { z } from "zod";

export const authEmailSchema = z.string().trim().email("Masukkan email yang valid").transform((value) => value.toLowerCase());
export const passwordSchema = z.string().min(8, "Password minimal 8 karakter").max(72, "Password maksimal 72 karakter");
export const loginPasswordSchema = z.string().min(1, "Password wajib diisi");
export const nameSchema = z.string().trim().min(2, "Nama minimal 2 karakter").max(120);
export const tenantNameSchema = z.string().trim().min(2, "Nama bisnis minimal 2 karakter").max(120);

export const loginSchema = z.object({
  email: authEmailSchema,
  password: loginPasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: authEmailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset token wajib diisi"),
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Password dan repeat password harus sama",
});

export const registerSchema = z.object({
  name: nameSchema,
  email: authEmailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema,
  tenantName: tenantNameSchema,
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Password dan repeat password harus sama",
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
