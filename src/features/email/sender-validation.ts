import { z } from "zod";

export const gmailAccountSchema = z.object({
  tenantId: z.string().uuid().optional().or(z.literal("")),
  label: z.string().trim().max(120),
  smtpUser: z.string().trim().email("Masukkan Gmail account yang valid").transform((value) => value.toLowerCase()),
  appPassword: z.string().trim().min(8, "App Password wajib diisi"),
});

export const mailSenderSchema = z.object({
  gmailAccountId: z.string().uuid("Pilih koneksi Gmail yang valid"),
  name: z.string().trim().min(2, "Nama sender minimal 2 karakter").max(120),
  fromEmail: z.string().trim().email("Masukkan alamat sender yang valid").transform((value) => value.toLowerCase()),
  isDefault: z.boolean(),
});

export const mailSenderUpdateSchema = z.object({
  isDefault: z.boolean().optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
});

export type GmailAccountInput = z.infer<typeof gmailAccountSchema>;
export type MailSenderInput = z.infer<typeof mailSenderSchema>;
